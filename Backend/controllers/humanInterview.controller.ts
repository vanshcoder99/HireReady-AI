import { Response } from 'express';
import { AuthRequest } from '../middlewares/isAuth';
import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { prisma } from '../config/connectDb';
import razorpay from '../services/razorpay.service';
import crypto from 'crypto';
import { askAi, askAiJson } from '../services/openRouter.service';
import { formatUserResponse } from './user.controller';

export const PLATFORM_COMMISSION_PERCENT = 20;

export const isSessionUpcoming = (dateStr: string, timeStr?: string): boolean => {
  if (!dateStr) return true;
  try {
    let cleanDateStr = dateStr.replace(/ at /i, ' ').trim();
    let combinedStr = cleanDateStr;
    if (timeStr && !cleanDateStr.toLowerCase().includes('pm') && !cleanDateStr.toLowerCase().includes('am')) {
      combinedStr = `${cleanDateStr} ${timeStr}`;
    }
    let parsedDate = new Date(combinedStr);
    if (isNaN(parsedDate.getTime())) {
      parsedDate = new Date(cleanDateStr);
      if (isNaN(parsedDate.getTime())) return true;
      if (timeStr) {
        let hours = 0, minutes = 0;
        const pmMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (pmMatch) {
          hours = parseInt(pmMatch[1], 10);
          minutes = parseInt(pmMatch[2], 10);
          const ampm = pmMatch[3] ? pmMatch[3].toUpperCase() : null;
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
        }
        parsedDate.setHours(hours, minutes, 0, 0);
      }
    }
    const threshold = new Date(Date.now() - 45 * 60 * 1000);
    return parsedDate >= threshold;
  } catch {
    return true;
  }
};

// 1. Create Interview Slot (Interviewer) - GATED BY KYC VERIFICATION
export const createInterviewSlot = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { role, experienceLevel, duration, date, time, price, availableSlots, requiredSkills, description } = req.body;
    if (!role || !date || !time) {
      return res.status(400).json({ message: 'Role, date, and time are required to create a slot.' });
    }

    if (!isSessionUpcoming(date, time)) {
      return res.status(400).json({ message: 'Cannot publish an interview slot for a past date or time.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'Interviewer not found.' });

    const formattedUser = formatUserResponse(user);
    const isApproved = formattedUser?.interviewerProfile?.isApproved;
    const vStatus = formattedUser?.interviewerProfile?.verificationDetails?.status;
    if (!isApproved && vStatus !== 'verified') {
      return res.status(403).json({
        message: 'Verification Required: You must complete Identity Verification (Resume, Degree & Matching Bank KYC) before publishing interview slots.',
        verificationStatus: vStatus || 'unverified',
        mismatchReason: formattedUser?.interviewerProfile?.verificationDetails?.mismatchReason || 'Verification not completed.',
      });
    }

    const slot = await prisma.interviewSlot.create({
      data: {
        interviewerId: userId,
        interviewerName: user.name,
        company: user.interviewerCompany || 'Tech Enterprise',
        role,
        experienceLevel: experienceLevel || 'Intermediate (1-3 yrs)',
        duration: duration || '45 Minutes',
        date,
        time,
        price: Number(price) || 299,
        availableSlots: Number(availableSlots) || 1,
        requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : ['JavaScript', 'React.js'],
        description: description || '',
        status: 'published',
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('slot-published', { slot });
    }

    return res.status(201).json({ message: 'Interview slot created & published successfully!', slot });
  } catch (error: any) {
    console.error('Create slot error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create slot.' });
  }
};

// 2. Browse Published Slots (Learner)
export const getPublishedSlots = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { role, experienceLevel, maxPrice, search } = req.query as Record<string, string>;

    const where: any = {
      status: 'published',
      availableSlots: { gt: 0 },
    };

    if (role && role !== 'All' && role !== 'undefined') {
      where.role = { contains: role, mode: 'insensitive' };
    }

    if (experienceLevel && experienceLevel !== 'All' && experienceLevel !== 'undefined') {
      const expClean = experienceLevel.split(' ')[0];
      where.experienceLevel = { contains: expClean, mode: 'insensitive' };
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      where.price = { lte: Number(maxPrice) };
    }

    if (search && search.trim()) {
      const query = search.trim();
      where.OR = [
        { role: { contains: query, mode: 'insensitive' } },
        { interviewerName: { contains: query, mode: 'insensitive' } },
        { company: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const slots = await prisma.interviewSlot.findMany({
      where,
      include: {
        interviewer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedSlots = slots
      .filter((s: any) => isSessionUpcoming(s.date, s.time))
      .map((s: any) => ({
        ...s,
        interviewer: formatUserResponse(s.interviewer),
        interviewerId: s.interviewerId || s.interviewer?.id,
      }));

    return res.status(200).json(formattedSlots || []);
  } catch (error) {
    console.error('Get published slots error:', error);
    return res.status(500).json({ message: 'Failed to fetch available slots.' });
  }
};

// 3. Get Interviewer's Own Created Slots
export const getInterviewerSlots = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const slots = await prisma.interviewSlot.findMany({
      where: { interviewerId: userId },
      include: {
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedSlots = slots.map((slot: any) => {
      const upcoming = isSessionUpcoming(slot.date, slot.time);
      const isBooked = slot.status === 'booked' || (slot.bookings && slot.bookings.length > 0);
      const booking = slot.bookings && slot.bookings.length > 0 ? slot.bookings[0] : null;
      let timeState = 'UPCOMING';
      if (!upcoming) {
        if (booking?.status === 'Completed' || slot.status === 'completed') {
          timeState = 'COMPLETED';
        } else if (isBooked) {
          timeState = 'BOOKED_PAST';
        } else {
          timeState = 'EXPIRED';
        }
      } else if (booking?.status === 'Live') {
        timeState = 'LIVE';
      }
      return {
        ...slot,
        isUpcoming: upcoming,
        timeState,
        booking,
        candidateName: booking?.user?.name || null,
        candidateEmail: booking?.user?.email || null,
      };
    });

    return res.status(200).json(formattedSlots);
  } catch (error) {
    console.error('Get interviewer slots error:', error);
    return res.status(500).json({ message: 'Failed to fetch interviewer slots.' });
  }
};

// 4. Delete Interview Slot
export const deleteInterviewSlot = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const slotId = req.params.id as string;
    const deleted = await prisma.interviewSlot.deleteMany({
      where: { id: slotId, interviewerId: userId },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: 'Slot not found or unauthorized.' });
    }

    return res.status(200).json({ message: 'Interview slot deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete slot.' });
  }
};

// 5a. Create Slot Booking Order (Razorpay)
export const createSlotBookingOrder = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { slotId } = req.body;
    if (!slotId) {
      return res.status(400).json({ message: 'Slot ID is required to initiate booking.' });
    }

    const slot = await prisma.interviewSlot.findUnique({ where: { id: slotId } });
    if (!slot || slot.availableSlots <= 0 || slot.status !== 'published') {
      return res.status(400).json({ message: 'This interview slot is no longer available.' });
    }

    const amountInRupees = slot.price || 299;
    const options = {
      amount: Math.round(amountInRupees * 100), // convert to paise
      currency: 'INR',
      receipt: `slot_rcpt_${Date.now()}_${slotId.slice(0, 6)}`,
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || '',
      slotId: slot.id,
      price: amountInRupees,
    });
  } catch (error: any) {
    console.error('Create slot booking order error:', error);
    return res.status(500).json({ message: `Failed to create booking order: ${error.message || error}` });
  }
};

// 5b. Verify Slot Booking Payment & Finalize Booking (Transaction-Safe)
export const verifySlotBookingPayment = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, slotId, notes } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !slotId) {
      return res.status(400).json({ message: 'Missing payment signature verification parameters.' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature. Verification failed.' });
    }

    // Execute atomic transaction for double-booking safety & accurate wallet ledgering
    const result = await prisma.$transaction(async (tx) => {
      const slot = await tx.interviewSlot.findUnique({ where: { id: slotId } });
      if (!slot || slot.availableSlots <= 0 || slot.status !== 'published') {
        throw new Error('This interview slot is no longer available.');
      }

      // Check idempotent duplicate payment
      const existingPayment = await tx.payment.findFirst({
        where: { razorpayOrderId: razorpay_order_id, status: 'paid' },
      });
      if (existingPayment) {
        const existingBooking = await tx.booking.findFirst({ where: { slotId: slot.id, userId } });
        return { booking: existingBooking, slot, alreadyProcessed: true };
      }

      // Record payment
      await tx.payment.create({
        data: {
          userId,
          planId: `slot-${slot.id}`,
          amount: slot.price,
          credits: 0,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          status: 'paid',
        },
      });

      const roomId = `room-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const slotDate = slot.date || 'Today';
      const slotTime = slot.time || '07:00 PM';
      const slotRole = slot.role || 'Frontend';
      const slotDuration = slot.duration || '45 Minutes';
      const interviewerId = slot.interviewerId || userId;

      // Create Booking
      const booking = await tx.booking.create({
        data: {
          userId,
          mentorId: interviewerId,
          slotId: slot.id,
          date: slotDate,
          timeSlot: slotTime,
          notes: notes || `Paid Interview Slot: ${slotRole} (${slotDuration})`,
          roomId,
          status: 'Scheduled',
        },
      });

      // Create Interview Room
      await tx.interviewRoom.create({
        data: {
          roomId,
          bookingId: booking.id,
          learnerId: userId,
          interviewerId: interviewerId,
          status: 'waiting',
        },
      });

      // Calculate Net Earnings with 20% platform commission
      let netEarnings = 0;
      if (slot.interviewerId) {
        const grossAmount = slot.price || 299;
        const platformFee = Math.round(grossAmount * (PLATFORM_COMMISSION_PERCENT / 100) * 10) / 10;
        netEarnings = Math.round((grossAmount - platformFee) * 10) / 10;

        await tx.interviewerEarnings.create({
          data: {
            interviewerId: slot.interviewerId,
            bookingId: booking.id,
            slotRole: slot.role,
            amount: grossAmount,
            platformFee,
            netEarnings,
            status: 'pending',
          },
        });

        // Update Interviewer Wallet Pending Earnings
        const wallet = await tx.interviewerWallet.upsert({
          where: { interviewerId: slot.interviewerId },
          update: {
            pendingBalance: { increment: netEarnings },
          },
          create: {
            interviewerId: slot.interviewerId,
            pendingBalance: netEarnings,
            balance: 0,
            totalEarned: 0,
            totalWithdrawn: 0,
          },
        });

        // Log Wallet Transaction (Pending Earnings)
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            interviewerId: slot.interviewerId,
            amount: netEarnings,
            type: 'EARNINGS_PENDING',
            status: 'COMPLETED',
            description: `Pending earnings for scheduled ${slotRole} interview (${slotDate})`,
            bookingId: booking.id,
          },
        });
      }

      // Decrement Available Slots safely
      const newAvailable = Math.max(0, slot.availableSlots - 1);
      await tx.interviewSlot.update({
        where: { id: slot.id },
        data: {
          availableSlots: newAvailable,
          status: newAvailable === 0 ? 'booked' : 'published',
        },
      });

      return { booking, slot, alreadyProcessed: false };
    }, { maxWait: 10000, timeout: 30000 });

    const { booking, slot } = result;

    // Real-Time Socket Notifications
    const io = req.app.get('io');
    if (io && booking) {
      io.emit('booking-confirmed', { booking });
      if (slot?.interviewerId) {
        io.to(`user-${slot.interviewerId}`).emit('booking-notification', {
          message: `New Paid Booking! A learner booked your ${slot.role} interview slot (${slot.date} at ${slot.time}).`,
          bookingId: booking.id,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and interview slot booked successfully!',
      booking,
    });
  } catch (error: any) {
    console.error('Verify slot booking payment error:', error);
    return res.status(500).json({ message: error.message || 'Failed to finalize slot booking.' });
  }
};

// 5. Book Published Slot (Legacy Direct Fallback)
export const bookInterviewSlot = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { slotId, notes } = req.body;
    let slot = null;

    if (slotId) {
      slot = await prisma.interviewSlot.findUnique({ where: { id: slotId } });
    }

    if (!slot) {
      slot = await prisma.interviewSlot.findFirst({ where: { status: 'published' } });
    }

    if (!slot) {
      return res.status(404).json({ message: 'No available interview slots found.' });
    }

    const roomId = `room-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const slotDate = slot.date || 'Today';
    const slotTime = slot.time || '07:00 PM';
    const slotRole = slot.role || 'Frontend';
    const slotDuration = slot.duration || '45 Minutes';
    const interviewerId = slot.interviewerId || userId;

    const booking = await prisma.booking.create({
      data: {
        userId,
        mentorId: interviewerId,
        slotId: slot.id,
        date: slotDate,
        timeSlot: slotTime,
        notes: notes || `Slot: ${slotRole} (${slotDuration})`,
        roomId,
        status: 'Scheduled',
      },
    });

    if (slot.interviewerId) {
      try {
        const amount = slot.price || 299;
        const platformFee = Math.round(amount * 0.2 * 10) / 10;
        const netEarnings = Math.round((amount - platformFee) * 10) / 10;

        await prisma.interviewerEarnings.create({
          data: {
            interviewerId: slot.interviewerId,
            bookingId: booking.id,
            slotRole: slot.role,
            amount,
            platformFee,
            netEarnings,
            status: 'pending',
          },
        });
      } catch (earnErr) {
        console.error('Interviewer earnings save warning:', earnErr);
      }
    }

    try {
      const newAvailable = Math.max(0, (slot.availableSlots || 1) - 1);
      await prisma.interviewSlot.update({
        where: { id: slot.id },
        data: {
          availableSlots: newAvailable,
          status: newAvailable <= 0 ? 'booked' : slot.status,
        },
      });
    } catch (slotErr) {
      console.error('Slot status update warning:', slotErr);
    }

    try {
      await prisma.interviewRoom.create({
        data: {
          roomId,
          bookingId: booking.id,
          learnerId: userId,
          interviewerId: interviewerId,
          status: 'waiting',
        },
      });
    } catch (rmErr) {
      console.error('Room create warning:', rmErr);
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('booking-confirmed', { bookingId: booking.id, roomId, userId });
      if (interviewerId) {
        io.to(`user-${interviewerId}`).emit('booking-notification', {
          message: `New booking confirmed for ${slotRole} interview on ${slotDate} at ${slotTime}`,
          bookingId: booking.id,
          roomId,
        });
      }
    }

    return res.status(201).json({
      message: 'Interview slot booked & payment confirmed!',
      booking,
    });
  } catch (error: any) {
    console.error('Book slot error:', error);
    return res.status(500).json({ message: error.message || 'Failed to book slot.' });
  }
};

// 6. Start Live Interview Session
export const startLiveSession = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const bookingId = req.params.id as string;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        mentor: true,
      },
    });
    if (!booking) return res.status(404).json({ message: 'Booking session not found.' });

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'Live' },
      include: {
        user: true,
        mentor: true,
      },
    });

    try {
      await prisma.interviewRoom.updateMany({
        where: { bookingId },
        data: { status: 'active', startTime: new Date() },
      });
    } catch (roomErr) {
      console.error('Room update warning:', roomErr);
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('interview-session-live', {
        bookingId: booking.id,
        roomId: booking.roomId,
        learnerId: booking.user?.id,
        interviewerId: booking.mentor?.id,
      });
      if (booking.user?.id) {
        io.to(`user-${booking.user.id}`).emit('interview-started-notification', {
          message: 'Your interviewer has started the interview. Join now!',
          bookingId: booking.id,
          roomId: booking.roomId,
        });
      }
    }

    return res.status(200).json({ message: 'Interview session is now LIVE!', booking: updatedBooking, roomId: booking.roomId });
  } catch (error) {
    console.error('Start live session error:', error);
    return res.status(500).json({ message: 'Failed to start live session.' });
  }
};

export const creditInterviewerWalletForCompletedBooking = async (bookingId: string) => {
  try {
    const earningsRecords = await prisma.interviewerEarnings.findMany({
      where: { bookingId, status: 'pending' },
    });

    for (const earn of earningsRecords) {
      await prisma.interviewerEarnings.update({
        where: { id: earn.id },
        data: { status: 'credited' },
      });

      const wallet = await prisma.interviewerWallet.upsert({
        where: { interviewerId: earn.interviewerId },
        update: {
          pendingBalance: { decrement: earn.netEarnings },
          balance: { increment: earn.netEarnings },
          totalEarned: { increment: earn.netEarnings },
        },
        create: {
          interviewerId: earn.interviewerId,
          balance: earn.netEarnings,
          totalEarned: earn.netEarnings,
          pendingBalance: 0,
          totalWithdrawn: 0,
        },
      });

      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          interviewerId: earn.interviewerId,
          amount: earn.netEarnings,
          type: 'EARNINGS_CREDITED',
          status: 'COMPLETED',
          description: `Net earnings credited for completed ${earn.slotRole} interview`,
          bookingId,
        },
      });
    }
  } catch (err) {
    console.error('Credit interviewer wallet error:', err);
  }
};

// 7. End Live Interview Session
export const endLiveSession = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const bookingId = req.params.id as string;
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ message: 'Booking session not found.' });

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'Completed' },
    });

    try {
      await prisma.interviewRoom.updateMany({
        where: { bookingId },
        data: { status: 'ended', endTime: new Date() },
      });
    } catch (roomErr) {
      console.error('Room update warning:', roomErr);
    }

    await creditInterviewerWalletForCompletedBooking(bookingId);

    const io = req.app.get('io');
    if (io) {
      io.emit('interview-session-ended', { bookingId: booking.id, roomId: booking.roomId });
    }

    return res.status(200).json({ message: 'Interview session concluded.', booking: updatedBooking });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to end session.' });
  }
};

// 8. Get Interviewer Earnings & Payout Summary
export const getInterviewerEarnings = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const earningsRecords = await prisma.interviewerEarnings.findMany({
      where: { interviewerId: userId },
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalGross = earningsRecords.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
    const totalPlatformFees = earningsRecords.reduce((acc: number, curr: any) => acc + (curr.platformFee || 0), 0);
    const totalNetEarnings = earningsRecords.reduce((acc: number, curr: any) => acc + (curr.netEarnings || 0), 0);

    const todayEarnings = earningsRecords
      .filter((rec: any) => new Date(rec.createdAt) >= startOfToday)
      .reduce((acc: number, curr: any) => acc + (curr.netEarnings || 0), 0);

    const weeklyEarnings = earningsRecords
      .filter((rec: any) => new Date(rec.createdAt) >= sevenDaysAgo)
      .reduce((acc: number, curr: any) => acc + (curr.netEarnings || 0), 0);

    const monthlyEarnings = earningsRecords
      .filter((rec: any) => new Date(rec.createdAt) >= thirtyDaysAgo)
      .reduce((acc: number, curr: any) => acc + (curr.netEarnings || 0), 0);

    const pendingPayouts = earningsRecords
      .filter((rec: any) => rec.status === 'pending')
      .reduce((acc: number, curr: any) => acc + (curr.netEarnings || 0), 0);

    const completedPayouts = earningsRecords
      .filter((rec: any) => rec.status === 'credited' || rec.status === 'completed')
      .reduce((acc: number, curr: any) => acc + (curr.netEarnings || 0), 0);

    const uniqueLearners = new Set(
      earningsRecords.map((rec: any) => rec.booking?.userId).filter(Boolean)
    );

    const completedBookings = await prisma.booking.findMany({
      where: { mentorId: userId, status: 'Completed' },
      select: { overallRating: true },
    });

    const totalRatingsSum = completedBookings.reduce((acc: number, curr: any) => acc + (curr.overallRating || 0), 0);
    const averageRating = completedBookings.length ? Math.round((totalRatingsSum / completedBookings.length) * 10) / 10 : 4.9;

    return res.status(200).json({
      grossRevenue: Math.round(totalGross * 10) / 10,
      platformFees: Math.round(totalPlatformFees * 10) / 10,
      netEarnings: Math.round(totalNetEarnings * 10) / 10,
      todayEarnings: Math.round(todayEarnings * 10) / 10,
      weeklyEarnings: Math.round(weeklyEarnings * 10) / 10,
      monthlyEarnings: Math.round(monthlyEarnings * 10) / 10,
      pendingPayouts: Math.round(pendingPayouts * 10) / 10,
      completedPayouts: Math.round(completedPayouts * 10) / 10,
      recordsCount: earningsRecords.length,
      totalStudentsInterviewed: uniqueLearners.size,
      averageRating,
      history: earningsRecords.map((rec: any) => ({
        id: rec.id,
        bookingId: rec.bookingId,
        slotRole: rec.slotRole,
        amount: rec.amount,
        platformFee: rec.platformFee,
        netEarnings: rec.netEarnings,
        status: rec.status,
        learnerName: rec.booking?.user?.name || 'Learner Candidate',
        date: rec.booking?.date || new Date(rec.createdAt).toLocaleDateString(),
        createdAt: rec.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Get interviewer earnings error:', error);
    return res.status(500).json({ message: 'Failed to fetch earnings overview.' });
  }
};

// 9. Update Bank & KYC Details
export const updateBankDetails = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { accountHolderName, bankName, accountNumber, ifscCode, upiId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        bankAccountHolderName: accountHolderName || user.bankAccountHolderName,
        bankName: bankName || user.bankName,
        accountNumber: accountNumber || user.accountNumber,
        ifscCode: ifscCode || user.ifscCode,
        upiId: upiId || user.upiId,
        bankIsVerified: true,
      },
    });

    return res.status(200).json({ message: 'Bank & payout details updated securely!', user: formatUserResponse(updatedUser) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update bank details.' });
  }
};

// 10. Get Learner Bookings
export const getUserBookings = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        mentor: true,
        slot: {
          select: {
            role: true,
            duration: true,
            requiredSkills: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedBookings = (bookings || []).map((b: any) => ({
      ...b,
      mentor: formatUserResponse(b.mentor),
      mentorId: b.mentorId || b.mentor?.id,
    }));

    return res.status(200).json(formattedBookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    return res.status(500).json({ message: 'Failed to fetch user bookings.' });
  }
};

// 11. Get Booking Details
export const getBookingDetails = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const bookingId = req.params.id as string;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        mentor: true,
      },
    });
    if (!booking) return res.status(404).json({ message: 'Interview session not found.' });

    const formattedBooking = {
      ...booking,
      user: formatUserResponse(booking.user),
      mentor: formatUserResponse(booking.mentor),
      userId: booking.userId || booking.user?.id,
      mentorId: booking.mentorId || booking.mentor?.id,
    };

    return res.status(200).json(formattedBooking);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch booking details.' });
  }
};

// 12. Cancel Booking
export const cancelBooking = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const bookingId = req.params.id as string;
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId },
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    if (booking.status === 'Live' || booking.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot cancel a live or completed interview.' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'Cancelled' },
    });

    if (booking.slotId) {
      try {
        await prisma.interviewSlot.update({
          where: { id: booking.slotId },
          data: {
            availableSlots: { increment: 1 },
            status: 'published',
          },
        });
      } catch (slotErr) {
        console.error('Slot restore warning:', slotErr);
      }
    }

    return res.status(200).json({ message: 'Interview booking cancelled.', booking: updatedBooking });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to cancel booking.' });
  }
};

// 13. Submit Feedback (Interviewer)
export const submitFeedback = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const {
      overallRating,
      technicalScore,
      communicationScore,
      problemSolvingScore,
      interviewerFeedback,
      strengths,
      weaknesses,
      suggestions,
      recommendation,
    } = req.body;

    const bookingId = req.params.id as string;
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    const finalScore = Math.round(
      ((Number(technicalScore || 0) + Number(communicationScore || 0) + Number(problemSolvingScore || 0)) / 3) * 10
    ) / 10;

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        overallRating: Number(overallRating) || 0,
        technicalScore: Number(technicalScore) || 0,
        communicationScore: Number(communicationScore) || 0,
        problemSolvingScore: Number(problemSolvingScore) || 0,
        finalScore,
        interviewerFeedback: interviewerFeedback || '',
        strengths: Array.isArray(strengths) ? strengths : [],
        weaknesses: Array.isArray(weaknesses) ? weaknesses : [],
        suggestions: Array.isArray(suggestions) ? suggestions : [],
        recommendation: recommendation || '',
        status: 'Completed',
      },
    });

    await creditInterviewerWalletForCompletedBooking(booking.id);

    return res.status(200).json({ message: 'Feedback submitted successfully.', booking: updatedBooking });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit feedback.' });
  }
};

// 14. Get Interviewer Dashboard
export const getInterviewerDashboard = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const bookings = await prisma.booking.findMany({
      where: { mentorId: userId },
      include: {
        user: true,
        slot: { select: { role: true, duration: true, requiredSkills: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedBookings = bookings.map((b: any) => ({
      ...b,
      user: formatUserResponse(b.user),
      userId: b.userId || b.user?.id,
    }));

    const todayInterviews = formattedBookings.filter((b: any) => {
      const isEligibleStatus = b.status === 'Scheduled' || b.status === 'Live' || b.status === 'confirmed';
      if (!isEligibleStatus) return false;
      if (b.status === 'Live') return true;
      return isSessionUpcoming(b.date, b.timeSlot);
    });
    const completedInterviews = formattedBookings.filter(
      (b: any) => b.status === 'Completed' || b.status === 'completed'
    );

    const totalRatingsSum = completedInterviews.reduce((acc: number, curr: any) => acc + (curr.overallRating || 0), 0);
    const avgRating = completedInterviews.length ? Math.round((totalRatingsSum / completedInterviews.length) * 10) / 10 : 4.9;

    const earningsRecords = await prisma.interviewerEarnings.findMany({
      where: { interviewerId: userId },
    });
    const totalNetEarnings = earningsRecords.reduce((acc: number, curr: any) => acc + (curr.netEarnings || 0), 0);

    return res.status(200).json({
      todayInterviews,
      completedInterviews,
      allBookings: formattedBookings,
      stats: {
        totalSessions: bookings.length,
        completed: completedInterviews.length,
        pending: todayInterviews.length,
        rating: avgRating,
        totalNetEarnings: Math.round(totalNetEarnings * 10) / 10,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch interviewer dashboard data.' });
  }
};

// 15. Get Interviewer Bookings
export const getInterviewerBookings = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const bookings = await prisma.booking.findMany({
      where: { mentorId: userId },
      include: {
        user: true,
        slot: { select: { role: true, duration: true, requiredSkills: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedBookings = (bookings || []).map((b: any) => ({
      ...b,
      user: formatUserResponse(b.user),
      userId: b.userId || b.user?.id,
    }));

    return res.status(200).json(formattedBookings);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch interviewer bookings.' });
  }
};

// 16. Get Learner Completed Interviews
export const getLearnerCompletedInterviews = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        status: 'Completed',
      },
      include: {
        mentor: true,
        slot: { select: { role: true, duration: true, requiredSkills: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedBookings = (bookings || []).map((b: any) => ({
      ...b,
      mentor: formatUserResponse(b.mentor),
      mentorId: b.mentorId || b.mentor?.id,
    }));

    return res.status(200).json(formattedBookings);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch completed interviews.' });
  }
};

// 17. AI Match Suggestions
export const getAiMatchSuggestions = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { targetRole, experienceLevel } = req.body;
    const messages: any[] = [
      { role: 'system', content: 'Provide 4 preparation guidelines for human mock interviews.' },
      { role: 'user', content: `Target Role: ${targetRole}\nLevel: ${experienceLevel || '0-2 years'}` },
    ];
    const suggestions = await askAi(messages);
    return res.status(200).json({ suggestions });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate AI suggestions.' });
  }
};

// 18. Get Room Messages
export const getRoomMessages = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const roomId = req.params.roomId as string;
    const messages = await prisma.interviewMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    });
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch chat history.' });
  }
};

// 19. AI Co-Interviewer Assist
export const getAiCoInterviewerAssist = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { transcriptSnippet } = req.body;
    const messages: any[] = [
      {
        role: 'system',
        content: `You are HireReady.AI live co-interviewer. Return JSON: { "followUpQuestions": ["q1"], "technicalSkillDetected": ["s1"], "softSkillDetected": ["clarity"] }`,
      },
      { role: 'user', content: `Transcript:\n${transcriptSnippet}` },
    ];
    const assistData = await askAiJson(messages);
    return res.status(200).json(assistData);
  } catch (error) {
    return res.status(500).json({ message: 'AI assist failed.' });
  }
};

// 20. Generate Final AI Interview Summary
export const generateFinalAiInterviewSummary = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { transcript } = req.body;
    const messages: any[] = [
      {
        role: 'system',
        content: `Return JSON: { "strengths": ["s1"], "weaknesses": ["w1"], "hiringRecommendation": "HIRE" }`,
      },
      { role: 'user', content: `Transcript:\n${transcript}` },
    ];
    const summaryData = await askAiJson(messages);
    return res.status(200).json(summaryData);
  } catch (error) {
    return res.status(500).json({ message: 'AI summary failed.' });
  }
};

// 21. Get Interviewer Profile
export const getInterviewerProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const profileId = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id: profileId },
    });
    if (!user) return res.status(404).json({ message: 'Interviewer not found.' });

    const formattedUser = formatUserResponse(user);
    return res.status(200).json(formattedUser);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch interviewer profile.' });
  }
};

// 22. Verify Interviewer Credentials
export const verifyInterviewerCredentials = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'Interviewer user not found.' });
    }

    const {
      accountHolderName = '',
      bankName = '',
      accountNumber = '',
      ifscCode = '',
      upiId = '',
      phoneNumber = '',
      dob = '',
      linkedinUrl = '',
      githubUrl = '',
      title = '',
      company = '',
      yearsOfExperience = '',
    } = req.body || {};

    const files = req.files as any;
    const resumeFile = files?.resume?.[0];
    const degreeFile = files?.degree?.[0];

    let resumeText = '';
    let degreeText = '';

    const getDocFn = (pdfjsLib as any).getDocument || (pdfjsLib as any).default?.getDocument;

    if (resumeFile && fs.existsSync(resumeFile.path)) {
      try {
        const fileBuffer = await fs.promises.readFile(resumeFile.path);
        const uint8Array = new Uint8Array(fileBuffer);
        const pdf = await getDocFn({ data: uint8Array }).promise;
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          resumeText += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        resumeText = resumeText.replace(/\s+/g, ' ').trim();
      } catch (e: any) {
        console.warn('Resume PDF parse warning:', e.message);
      } finally {
        if (fs.existsSync(resumeFile.path)) fs.unlinkSync(resumeFile.path);
      }
    }

    if (degreeFile && fs.existsSync(degreeFile.path)) {
      try {
        const fileBuffer = await fs.promises.readFile(degreeFile.path);
        const uint8Array = new Uint8Array(fileBuffer);
        const pdf = await getDocFn({ data: uint8Array }).promise;
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          degreeText += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        degreeText = degreeText.replace(/\s+/g, ' ').trim();
      } catch (e: any) {
        console.warn('Degree PDF parse warning:', e.message);
      } finally {
        if (fs.existsSync(degreeFile.path)) fs.unlinkSync(degreeFile.path);
      }
    }

    const promptMessages: any[] = [
      {
        role: 'system',
        content: `You are an Automated Security Auditor & KYC Verification Engine for technical interviewers.
Parse the text extracted from the candidate's uploaded Resume and Educational Degree / Certification document.

Return strictly valid JSON:
{
  "extractedResumeName": "Full Candidate Name found on Resume",
  "extractedDegreeName": "Full Name found on Degree Certificate",
  "extractedExperienceYears": 5,
  "extractedSkills": ["React.js", "Node.js", "System Design"],
  "degreeTitle": "Bachelor of Technology in Computer Science",
  "auditSummary": "Resume and Degree confirm technical expertise as a Senior Engineer."
}`,
      },
      {
        role: 'user',
        content: `User Registered Name: ${user.name}\nBank Account Holder Name: ${accountHolderName || user.bankAccountHolderName || user.name}\n\nResume Document Content:\n${resumeText ? resumeText.slice(0, 3500) : 'None provided'}\n\nDegree Document Content:\n${degreeText ? degreeText.slice(0, 2000) : 'None provided'}`,
      },
    ];

    let aiAudit = await askAiJson(promptMessages);

    const extractedResumeName = aiAudit.extractedResumeName || user.name;
    const extractedDegreeName = aiAudit.extractedDegreeName || user.name;
    const extractedExperienceYears = Number(aiAudit.extractedExperienceYears) || user.yearsOfExperience || 3;
    const extractedSkills = Array.isArray(aiAudit.extractedSkills) ? aiAudit.extractedSkills : (user.skills.length ? user.skills : ['System Design', 'JavaScript']);

    const targetBankName = (accountHolderName || user.bankAccountHolderName || user.name).trim();
    const targetResumeName = extractedResumeName.trim();
    const targetUserName = user.name.trim();

    const nameMatchScore = calculateNameMatchScore(targetBankName, targetResumeName, targetUserName);
    const isNameMatched = nameMatchScore >= 50;

    let status = 'verified';
    let mismatchReason = '';
    let isApproved = true;

    if (!isNameMatched) {
      status = 'rejected';
      isApproved = false;
      mismatchReason = `SECURITY MISMATCH ALERT: Bank Account Holder Name ("${targetBankName}") does not match the Name extracted from the uploaded Resume ("${targetResumeName}") or User Account ("${targetUserName}"). Fake or mismatched identity credentials are strictly prohibited.`;
    } else if (extractedExperienceYears < 1) {
      status = 'rejected';
      isApproved = false;
      mismatchReason = `EXPERIENCE MISMATCH: Uploaded resume shows less than 1 year of technical experience. A minimum of 1-2 years of verified tech experience is required to conduct mock interviews.`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        phoneNumber: phoneNumber || user.phoneNumber,
        dob: dob || user.dob,
        linkedinUrl: linkedinUrl || user.linkedinUrl,
        githubUrl: githubUrl || user.githubUrl,
        interviewerTitle: title || user.interviewerTitle,
        interviewerCompany: company || user.interviewerCompany,
        yearsOfExperience: Number(yearsOfExperience) || user.yearsOfExperience,
        bankAccountHolderName: targetBankName,
        bankName: bankName || user.bankName,
        accountNumber: accountNumber || user.accountNumber,
        ifscCode: (ifscCode || user.ifscCode || '').toUpperCase(),
        upiId: upiId || user.upiId,
        bankIsVerified: isNameMatched,
        resumeUrl: resumeFile ? `/uploads/${resumeFile.filename}` : user.resumeUrl,
        resumeOriginalName: resumeFile ? resumeFile.originalname : user.resumeOriginalName,
        degreeUrl: degreeFile ? `/uploads/${degreeFile.filename}` : user.degreeUrl,
        degreeOriginalName: degreeFile ? degreeFile.originalname : user.degreeOriginalName,
        verificationStatus: status,
        extractedResumeName: targetResumeName,
        extractedDegreeName,
        extractedExperienceYears,
        extractedSkills,
        nameMatchScore,
        isNameMatched,
        mismatchReason,
        auditSummary: aiAudit.auditSummary || `Name match score ${nameMatchScore}%. ${isNameMatched ? 'Verification passed.' : 'Identity discrepancy flagged.'}`,
        auditedAt: new Date(),
        isApproved,
      },
    });

    const formattedUser = formatUserResponse(updatedUser);

    return res.status(200).json({
      message: isNameMatched
        ? 'Interviewer Credentials & KYC Bank Match Verified Successfully!'
        : 'Interviewer Credentials Audit Warning: Name mismatch detected.',
      verification: formattedUser.interviewerProfile.verificationDetails,
      bankDetails: formattedUser.interviewerProfile.bankDetails,
      isApproved: formattedUser.interviewerProfile.isApproved,
      user: formattedUser,
    });
  } catch (error: any) {
    console.error('Verify interviewer credentials error:', error);
    return res.status(500).json({ message: error.message || 'Failed to verify interviewer credentials.' });
  }
};

function calculateNameMatchScore(bankName = '', resumeName = '', userName = '') {
  const norm = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  const b = norm(bankName);
  const r = norm(resumeName);
  const u = norm(userName);

  if (!b) return 0;
  if (b === r || b === u) return 100;

  const bankWords = b.split(' ').filter((w) => w.length > 1);
  const resumeWords = r.split(' ').filter((w) => w.length > 1);
  const userWords = u.split(' ').filter((w) => w.length > 1);

  const matchInResume = bankWords.filter((w) => resumeWords.includes(w));
  const matchInUser = bankWords.filter((w) => userWords.includes(w));

  const maxMatches = Math.max(matchInResume.length, matchInUser.length);

  if (maxMatches === 0) return 0;

  const score = Math.round((maxMatches / bankWords.length) * 100);
  return score;
}

// 23. Get Interviewer Wallet Overview
export const getInterviewerWallet = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    let wallet = await prisma.interviewerWallet.findUnique({
      where: { interviewerId: userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!wallet) {
      wallet = await prisma.interviewerWallet.create({
        data: {
          interviewerId: userId,
          balance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
        },
        include: {
          transactions: true,
        },
      });
    }

    const withdrawalRequests = await prisma.withdrawalRequest.findMany({
      where: { interviewerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const maskedAccountNumber = user?.accountNumber
      ? user.accountNumber.length > 4
        ? `XXXX-XXXX-${user.accountNumber.slice(-4)}`
        : user.accountNumber
      : '';

    return res.status(200).json({
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
        pendingBalance: wallet.pendingBalance,
        totalEarned: wallet.totalEarned,
        totalWithdrawn: wallet.totalWithdrawn,
      },
      bankDetails: {
        accountHolderName: user?.bankAccountHolderName || '',
        bankName: user?.bankName || '',
        maskedAccountNumber,
        accountNumber: user?.accountNumber || '',
        ifscCode: user?.ifscCode || '',
        upiId: user?.upiId || '',
        isVerified: Boolean(user?.bankIsVerified),
      },
      transactions: wallet.transactions || [],
      withdrawalRequests: withdrawalRequests || [],
    });
  } catch (error: any) {
    console.error('Get interviewer wallet error:', error);
    return res.status(500).json({ message: 'Failed to fetch wallet information.' });
  }
};

// 24. Submit Cash Out / Withdrawal Request
export const requestWithdrawal = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { amount } = req.body;
    const withdrawAmount = Number(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ message: 'Please enter a valid withdrawal amount greater than 0.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.accountNumber || !user.ifscCode || !user.bankAccountHolderName) {
      return res.status(400).json({
        message: 'Bank KYC details (Account Holder Name, Account Number & IFSC Code) are required before requesting cash out. Please update your Bank details.',
      });
    }

    const wallet = await prisma.interviewerWallet.findUnique({ where: { interviewerId: userId } });
    if (!wallet || wallet.balance < withdrawAmount) {
      return res.status(400).json({
        message: `Insufficient available wallet balance. Your available wallet balance is ₹${wallet?.balance || 0}.`,
      });
    }

    const withdrawalResult = await prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.interviewerWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: withdrawAmount },
          totalWithdrawn: { increment: withdrawAmount },
        },
      });

      const withdrawalRequest = await tx.withdrawalRequest.create({
        data: {
          interviewerId: userId,
          amount: withdrawAmount,
          status: 'PENDING',
          accountHolderName: user.bankAccountHolderName!,
          accountNumber: user.accountNumber!,
          ifscCode: user.ifscCode!,
          bankName: user.bankName || 'Partner Bank',
          upiId: user.upiId || '',
        },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          interviewerId: userId,
          amount: -withdrawAmount,
          type: 'WITHDRAWAL_REQUEST',
          status: 'PENDING',
          description: `Withdrawal request submitted to bank account ending in ${user.accountNumber?.slice(-4)}`,
        },
      });

      return { updatedWallet, withdrawalRequest, transaction };
    });

    return res.status(200).json({
      success: true,
      message: `Withdrawal request for ₹${withdrawAmount} submitted successfully! Status: PENDING (Processing by admin/payout engine).`,
      withdrawal: withdrawalResult.withdrawalRequest,
      newBalance: withdrawalResult.updatedWallet.balance,
    });
  } catch (error: any) {
    console.error('Request withdrawal error:', error);
    return res.status(500).json({ message: error.message || 'Failed to submit withdrawal request.' });
  }
};

