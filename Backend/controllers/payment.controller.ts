import { Response } from 'express';
import { AuthRequest } from '../middlewares/isAuth';
import razorpay from '../services/razorpay.service';
import { prisma } from '../config/connectDb';
import crypto from 'crypto';
import { formatUserResponse } from './user.controller';

const PLAN_CATALOG: Record<string, { amount: number; credits: number }> = {
  basic: { amount: 100, credits: 150 },
  pro: { amount: 500, credits: 650 },
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    let { planId, amount, credits } = req.body;

    // Validate plan with server catalog if available
    if (planId && PLAN_CATALOG[planId]) {
      amount = PLAN_CATALOG[planId].amount;
      credits = PLAN_CATALOG[planId].credits;
    }

    if (!amount || amount <= 0 || !credits || credits <= 0) {
      return res.status(400).json({ message: 'Invalid plan price or credit allocation' });
    }

    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized user' });

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${userId.slice(0, 8)}`,
    };

    const order = await razorpay.orders.create(options);

    await prisma.payment.create({
      data: {
        userId,
        planId: planId || 'custom',
        amount,
        credits,
        razorpayOrderId: order.id,
        status: 'created',
      },
    });

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || '',
      order,
    });
  } catch (error: any) {
    console.error('Create Razorpay order error:', error);
    return res.status(500).json({ message: `Failed to create Razorpay order: ${error.message || error}` });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment signature verification parameters' });
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

    const payment = await prisma.payment.findFirst({
      where: {
        razorpayOrderId: razorpay_order_id,
      },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found in system' });
    }

    if (payment.status === 'paid') {
      const existingUser = await prisma.user.findUnique({ where: { id: payment.userId } });
      return res.json({
        success: true,
        message: 'Payment already verified and processed',
        user: formatUserResponse(existingUser),
      });
    }

    // Update payment record in database
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'paid',
        razorpayPaymentId: razorpay_payment_id,
      },
    });

    // Atomically increment user credits in PostgreSQL
    const updatedUser = await prisma.user.update({
      where: { id: payment.userId },
      data: {
        credits: {
          increment: payment.credits || 0,
        },
      },
    });

    return res.json({
      success: true,
      message: `Payment successful! ${payment.credits} credits added to your account.`,
      user: formatUserResponse(updatedUser),
    });
  } catch (error: any) {
    console.error('Verify Razorpay payment error:', error);
    return res.status(500).json({ message: `Failed to verify payment: ${error.message || error}` });
  }
};

