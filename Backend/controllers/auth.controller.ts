import { Request, Response } from 'express';
import genToken from '../config/token';
import { prisma } from '../config/connectDb';
import { formatUserResponse } from './user.controller';

export const googleAuth = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and Email are required', statusCode: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
        },
      });
    }

    const token = await genToken(user.id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      user: formatUserResponse(user),
      message: 'user created or logged in successfully',
      statusCode: 200,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `Google auth error ${error.message || error}`,
    });
  }
};

export const logOut = async (_req: Request, res: Response): Promise<any> => {
  try {
    res.clearCookie('token');
    return res.status(200).json({
      message: 'Logout Successfully',
      StatusCode: 200,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `Logout error ${error.message || error}`,
      StatusCode: 500,
    });
  }
};
