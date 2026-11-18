import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import dotenv from 'dotenv';
import connectDb, { prisma } from './config/connectDb';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRouter from './routes/auth.route';
import userRouter from './routes/user.route';
import paymentRouter from './routes/payment.route';
import interviewRouter from './routes/interview.route';
import documentRouter from './routes/document.route';
import aiRouter from './routes/ai.route';
import humanInterviewRouter from './routes/humanInterview.route';
import resumeRouter from './routes/resume.route';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // If no origin (e.g. mobile apps, curl, server-to-server), allow it
    if (!origin) return callback(null, true);
    // Dynamically reflect the requesting origin so withCredentials: true works
    callback(null, origin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, origin || true);
    },
    credentials: true,
  },
});

app.set('io', io);

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use('/public', express.static('public'));
app.use('/uploads', express.static('public'));
app.use('/uploads', express.static('uploads'));

app.get('/', (_req, res) => {
  res.status(200).json({ status: 'active', message: 'HireReady.AI Backend API is up and running' });
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/document', documentRouter);
app.use('/api/ai', aiRouter);
app.use('/api/human-interview', humanInterviewRouter);
app.use('/api/resume', resumeRouter);

interface CustomSocket extends Socket {
  roomId?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
}

// Helper: Map all equivalent room identifiers (e.g. Booking UUID vs room-xxx-xxx)
const getAssociatedRoomIds = async (roomId: string, bookingId?: string): Promise<string[]> => {
  const ids = new Set<string>();
  if (roomId) ids.add(String(roomId));
  if (bookingId) ids.add(String(bookingId));

  try {
    const candidates = [
      ...(roomId ? [{ id: String(roomId) }, { roomId: String(roomId) }] : []),
      ...(bookingId ? [{ id: String(bookingId) }, { roomId: String(bookingId) }] : []),
    ];
    if (candidates.length > 0) {
      const b = await prisma.booking.findFirst({
        where: { OR: candidates },
      });
      if (b) {
        if (b.id) ids.add(String(b.id));
        if (b.roomId) ids.add(String(b.roomId));
      }
    }
  } catch (err) {
    console.warn('getAssociatedRoomIds note:', err);
  }

  return Array.from(ids);
};

// Socket.IO WebRTC Signaling & Real-time Live Chat Handlers
io.on('connection', (socket: CustomSocket) => {
  console.log(`Socket Connected: ${socket.id}`);

  // 1. Join Room (Unified across Booking UUID and custom roomId)
  socket.on('join-room', async ({ roomId, bookingId, legacyRoomId, userId, name, role }) => {
    const primaryRoom = String(roomId || bookingId || 'default-room');
    const associatedRooms = await getAssociatedRoomIds(primaryRoom, bookingId || legacyRoomId);

    // Join all equivalent room identifiers
    associatedRooms.forEach((r) => socket.join(r));
    socket.roomId = primaryRoom;
    socket.userId = userId;
    socket.userName = name;
    socket.userRole = role;

    console.log(`Socket ${socket.id} (${name}) joined rooms: ${associatedRooms.join(', ')}`);

    // Notify other peers in these rooms (Socket.io deduplicates clients in multiple rooms)
    socket.to(associatedRooms).emit('user-connected', {
      socketId: socket.id,
      userId,
      name,
      role,
      roomId: primaryRoom,
    });

    // Provide existing peers in the room to the newly joined peer
    try {
      const roomSockets = await io.in(primaryRoom).fetchSockets();
      const existingPeers = roomSockets
        .filter((s) => s.id !== socket.id)
        .map((s) => ({
          socketId: s.id,
          userId: (s as any).userId,
          name: (s as any).userName,
          role: (s as any).userRole,
        }));

      if (existingPeers.length > 0) {
        socket.emit('room-peers', { peers: existingPeers });
      }
    } catch (err) {
      console.warn('Fetch room sockets error:', err);
    }

    // Sync session live status & timer if interview already started
    try {
      const roomRec = await prisma.interviewRoom.findFirst({
        where: {
          OR: [
            ...associatedRooms.map((r) => ({ roomId: r })),
            ...(bookingId ? [{ bookingId: String(bookingId) }] : []),
            ...(primaryRoom ? [{ bookingId: String(primaryRoom) }] : []),
          ],
        },
      });

      if (roomRec && roomRec.status === 'active' && roomRec.startTime) {
        const elapsed = Math.max(0, Math.floor((Date.now() - new Date(roomRec.startTime).getTime()) / 1000));
        socket.emit('session-sync', {
          status: 'active',
          startTime: roomRec.startTime,
          elapsedSeconds: elapsed,
        });
      }
    } catch (err) {
      console.warn('Session sync check note:', err);
    }

    // Send system message to all associated rooms
    try {
      const sysMsg = await prisma.interviewMessage.create({
        data: {
          roomId: primaryRoom,
          senderName: 'System',
          senderRole: 'system',
          message: `${name || 'A participant'} joined the interview room.`,
          type: 'system',
        },
      });
      io.to(associatedRooms).emit('message', sysMsg);
    } catch (err) {
      console.error('System message creation error:', err);
    }
  });

  // 1b. Register user for targeted notifications
  socket.on('register-user', ({ userId }) => {
    if (userId) {
      socket.userId = userId;
      socket.join(`user-${userId}`);
    }
  });

  // 2. WebRTC Signaling: Offer, Answer, ICE Candidate (Direct Socket Relay)
  socket.on('offer', ({ targetId, offer }) => {
    io.to(targetId).emit('offer', {
      socketId: socket.id,
      offer,
    });
  });

  socket.on('answer', ({ targetId, answer }) => {
    io.to(targetId).emit('answer', {
      socketId: socket.id,
      answer,
    });
  });

  socket.on('ice-candidate', ({ targetId, candidate }) => {
    io.to(targetId).emit('ice-candidate', {
      socketId: socket.id,
      candidate,
    });
  });

  // 3. Typing Indicators (Dispatched to all room aliases)
  socket.on('typing', async ({ roomId, name }) => {
    const associatedRooms = await getAssociatedRoomIds(String(roomId || socket.roomId));
    socket.to(associatedRooms).emit('typing', { name });
  });

  socket.on('stop-typing', async ({ roomId, name }) => {
    const associatedRooms = await getAssociatedRoomIds(String(roomId || socket.roomId));
    socket.to(associatedRooms).emit('stop-typing', { name });
  });

  // 4. Live Chat Message (Persisted & Broadcasted to all room aliases)
  socket.on('message', async ({ roomId, bookingId, message, senderId, senderName, senderRole, type }) => {
    const primaryRoom = String(roomId || bookingId || socket.roomId);
    const associatedRooms = await getAssociatedRoomIds(primaryRoom, bookingId);

    try {
      const msg = await prisma.interviewMessage.create({
        data: {
          roomId: primaryRoom,
          senderId: senderId || null,
          senderName: senderName || socket.userName || 'User',
          senderRole: senderRole || socket.userRole || 'learner',
          message,
          type: type || 'text',
        },
      });

      io.to(associatedRooms).emit('message', msg);
    } catch (err) {
      console.error('Socket message error:', err);
    }
  });

  // 5. Interview Lifecycle Events
  socket.on('interview-start', async ({ roomId, bookingId }) => {
    const primaryRoom = String(roomId || bookingId || socket.roomId);
    const associatedRooms = await getAssociatedRoomIds(primaryRoom, bookingId);

    io.emit('interview-session-live', { roomId: primaryRoom, bookingId });
    socket.to(associatedRooms).emit('interview-start', { timestamp: new Date() });

    try {
      const now = new Date();
      await prisma.interviewRoom.updateMany({
        where: {
          OR: associatedRooms.map((r) => ({ roomId: r })),
        },
        data: { status: 'active', startTime: now },
      });

      const sysMsg = await prisma.interviewMessage.create({
        data: {
          roomId: primaryRoom,
          senderName: 'System',
          senderRole: 'system',
          message: 'Interview officially started. Live evaluation is in progress.',
          type: 'system',
        },
      });
      io.to(associatedRooms).emit('message', sysMsg);
    } catch (err) {
      console.error('Interview start socket error:', err);
    }
  });

  socket.on('interview-end', async ({ roomId, bookingId }) => {
    const primaryRoom = String(roomId || bookingId || socket.roomId);
    const associatedRooms = await getAssociatedRoomIds(primaryRoom, bookingId);

    io.emit('interview-session-ended', { roomId: primaryRoom, bookingId });
    socket.to(associatedRooms).emit('interview-end', { timestamp: new Date() });

    try {
      await prisma.interviewRoom.updateMany({
        where: {
          OR: associatedRooms.map((r) => ({ roomId: r })),
        },
        data: { status: 'ended', endTime: new Date() },
      });

      const sysMsg = await prisma.interviewMessage.create({
        data: {
          roomId: primaryRoom,
          senderName: 'System',
          senderRole: 'system',
          message: 'Interview has concluded. Generating final AI report...',
          type: 'system',
        },
      });
      io.to(associatedRooms).emit('message', sysMsg);
    } catch (err) {
      console.error('Interview end socket error:', err);
    }
  });

  // 6. Media Controls (Camera, Mic, Screen Share, Network)
  socket.on('camera-toggle', async ({ roomId, enabled }) => {
    const associatedRooms = await getAssociatedRoomIds(String(roomId || socket.roomId));
    socket.to(associatedRooms).emit('camera-toggle', { socketId: socket.id, enabled });
  });

  socket.on('mic-toggle', async ({ roomId, enabled }) => {
    const associatedRooms = await getAssociatedRoomIds(String(roomId || socket.roomId));
    socket.to(associatedRooms).emit('mic-toggle', { socketId: socket.id, enabled });
  });

  socket.on('screen-share-start', async ({ roomId }) => {
    const associatedRooms = await getAssociatedRoomIds(String(roomId || socket.roomId));
    socket.to(associatedRooms).emit('screen-share-start', { socketId: socket.id, name: socket.userName });
  });

  socket.on('screen-share-stop', async ({ roomId }) => {
    const associatedRooms = await getAssociatedRoomIds(String(roomId || socket.roomId));
    socket.to(associatedRooms).emit('screen-share-stop', { socketId: socket.id });
  });

  socket.on('network-status', async ({ roomId, quality }) => {
    const associatedRooms = await getAssociatedRoomIds(String(roomId || socket.roomId));
    socket.to(associatedRooms).emit('network-status', { socketId: socket.id, quality });
  });

  // 7. Leave Room & Disconnect
  socket.on('leave-room', async ({ roomId }) => {
    const associatedRooms = await getAssociatedRoomIds(String(roomId || socket.roomId));
    associatedRooms.forEach((r) => socket.leave(r));
    socket.to(associatedRooms).emit('user-disconnected', { socketId: socket.id, name: socket.userName });
  });

  socket.on('disconnect', async () => {
    if (socket.roomId) {
      const associatedRooms = await getAssociatedRoomIds(socket.roomId);
      socket.to(associatedRooms).emit('user-disconnected', { socketId: socket.id, name: socket.userName });
    }
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, async () => {
  await connectDb();
  console.log(`Server and Socket.IO running on port ${PORT}`);
});
