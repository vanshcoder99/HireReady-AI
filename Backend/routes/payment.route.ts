import express from 'express';
import isAuth from '../middlewares/isAuth';
import { createOrder, verifyPayment } from '../controllers/payment.controller';

const paymentRouter = express.Router();

paymentRouter.post('/create-order', isAuth, createOrder);
paymentRouter.post('/verify-payment', isAuth, verifyPayment);
paymentRouter.post('/verify', isAuth, verifyPayment);


export default paymentRouter;
