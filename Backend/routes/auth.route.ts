import express from 'express';
import { googleAuth, logOut, signUp, login } from '../controllers/auth.controller';

const authRouter = express.Router();

authRouter.post('/signup', signUp);
authRouter.post('/login', login);
authRouter.post('/google', googleAuth);
authRouter.get('/logout', logOut);

export default authRouter;
