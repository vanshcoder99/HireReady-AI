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

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
    credentials: true,
  },
});

app.set('io', io);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use('/public', express.static('public'));
app.use('/uploads', express.static('public'));
app.use('/uploads', express.static('uploads'));

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

// Socket.IO WebRTC Signaling & Real-time Live Chat Handlers
io.on('connection', (socket: CustomSocket) => {
  console.log(`Socket Connected: ${socket.id}`);

  // 1. Join Room
  socket.on('join-room', async ({ roomId, userId, name, role }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userId = userId;
    socket.userName = name;
    socket.userRole = role;

    // Notify room of user connection
    socket.to(roomId).emit('user-connected', {
      socketId: socket.id,
      userId,
      name,
      role,
    });

    // Send system message
    try {
      const sysMsg = await prisma.interviewMessage.create({
        data: {
          roomId,
          senderName: 'System',
          senderRole: 'system',
          message: `${name || 'A participant'} joined the interview room.`,
          type: 'system',
        },
      });
      io.to(roomId).emit('message', sysMsg);
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

  // 2. WebRTC Signaling: Offer, Answer, ICE Candidate
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

  // 3. Typing Indicators
  socket.on('typing', ({ roomId, name }) => {
    socket.to(roomId).emit('typing', { name });
  });

  socket.on('stop-typing', ({ roomId, name }) => {
    socket.to(roomId).emit('stop-typing', { name });
  });

  // 4. Live Chat Message (Persisted in PostgreSQL via Prisma)
  socket.on('message', async ({ roomId, message, senderId, senderName, senderRole, type }) => {
    try {
      const msg = await prisma.interviewMessage.create({
        data: {
          roomId,
          senderId: senderId || null,
          senderName: senderName || socket.userName || 'User',
          senderRole: senderRole || socket.userRole || 'learner',
          message,
          type: type || 'text',
        },
      });

      io.to(roomId).emit('message', msg);
    } catch (err) {
      console.error('Socket message error:', err);
    }
  });

  // 5. Interview Lifecycle Events
  socket.on('interview-start', async ({ roomId, bookingId }) => {
    io.emit('interview-session-live', { roomId, bookingId });
    socket.to(roomId).emit('interview-start', { timestamp: new Date() });

    try {
      await prisma.interviewRoom.updateMany({
        where: { roomId },
        data: { status: 'active', startTime: new Date() },
      });

      const sysMsg = await prisma.interviewMessage.create({
        data: {
          roomId,
          senderName: 'System',
          senderRole: 'system',
          message: 'Interview officially started. Live evaluation is in progress.',
          type: 'system',
        },
      });
      io.to(roomId).emit('message', sysMsg);
    } catch (err) {
      console.error('Interview start socket error:', err);
    }
  });

  socket.on('interview-end', async ({ roomId, bookingId }) => {
    io.emit('interview-session-ended', { roomId, bookingId });
    socket.to(roomId).emit('interview-end', { timestamp: new Date() });

    try {
      await prisma.interviewRoom.updateMany({
        where: { roomId },
        data: { status: 'ended', endTime: new Date() },
      });

      const sysMsg = await prisma.interviewMessage.create({
        data: {
          roomId,
          senderName: 'System',
          senderRole: 'system',
          message: 'Interview has concluded. Generating final AI report...',
          type: 'system',
        },
      });
      io.to(roomId).emit('message', sysMsg);
    } catch (err) {
      console.error('Interview end socket error:', err);
    }
  });

  // 6. Media Controls (Camera, Mic, Screen Share, Network)
  socket.on('camera-toggle', ({ roomId, enabled }) => {
    socket.to(roomId).emit('camera-toggle', { socketId: socket.id, enabled });
  });

  socket.on('mic-toggle', ({ roomId, enabled }) => {
    socket.to(roomId).emit('mic-toggle', { socketId: socket.id, enabled });
  });

  socket.on('screen-share-start', ({ roomId }) => {
    socket.to(roomId).emit('screen-share-start', { socketId: socket.id, name: socket.userName });
  });

  socket.on('screen-share-stop', ({ roomId }) => {
    socket.to(roomId).emit('screen-share-stop', { socketId: socket.id });
  });

  socket.on('network-status', ({ roomId, quality }) => {
    socket.to(roomId).emit('network-status', { socketId: socket.id, quality });
  });

  // 7. Leave Room & Disconnect
  socket.on('leave-room', async ({ roomId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-disconnected', { socketId: socket.id, name: socket.userName });
  });

  socket.on('disconnect', () => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('user-disconnected', { socketId: socket.id, name: socket.userName });
    }
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, async () => {
  await connectDb();
  console.log(`Server and Socket.IO running on port ${PORT}`);
});
