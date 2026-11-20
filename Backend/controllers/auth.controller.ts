import { Request, Response } from 'express';
import genToken from '../config/token';
import { prisma } from '../config/connectDb';
import { formatUserResponse } from './user.controller';
import { hashPassword, verifyPassword } from '../utils/password';

export const signUp = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, username, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required', statusCode: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address', statusCode: 400 });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long', statusCode: 400 });
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return res.status(400).json({ message: 'An account with this email already exists. Please sign in.', statusCode: 400 });
    }

    let cleanUsername = username ? username.toLowerCase().trim().replace(/^@+/, '') : null;
    if (cleanUsername) {
      if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(cleanUsername)) {
        return res.status(400).json({ message: 'Username must be 3-30 characters (letters, numbers, _, -)', statusCode: 400 });
      }
      const existingUsername = await prisma.user.findFirst({
        where: { username: cleanUsername },
      });
      if (existingUsername) {
        return res.status(400).json({ message: 'This username is already taken. Please choose another.', statusCode: 400 });
      }
    } else {
      const baseName = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'user';
      cleanUsername = `${baseName}_${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const hashedPassword = hashPassword(password);
    const assignedRole = role === 'interviewer' ? 'interviewer' : 'learner';

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        role: assignedRole,
        credits: 100,
      },
    });

    const token = await genToken(user.id);
    const isSecure = process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      user: formatUserResponse(user),
      token,
      message: 'Account created successfully',
      statusCode: 201,
    });
  } catch (error: any) {
    console.error('Sign up error:', error);
    return res.status(500).json({
      message: `Sign up error: ${error.message || error}`,
      statusCode: 500,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Email/Username and Password are required', statusCode: 400 });
    }

    const identifier = emailOrUsername.toLowerCase().trim().replace(/^@+/, '');

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email/username or password', statusCode: 401 });
    }

    if (!user.password) {
      return res.status(400).json({
        message: 'This account was registered using Google. Please click "Continue with Google" or set a password in your Profile.',
        statusCode: 400,
      });
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email/username or password', statusCode: 401 });
    }

    const token = await genToken(user.id);
    const isSecure = process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      user: formatUserResponse(user),
      token,
      message: 'Logged in successfully',
      statusCode: 200,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      message: `Login error: ${error.message || error}`,
      statusCode: 500,
    });
  }
};

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
      const baseName = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'user';
      const defaultUsername = `${baseName}_${Math.floor(1000 + Math.random() * 9000)}`;
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          username: defaultUsername,
          email: email.toLowerCase().trim(),
        },
      });
    }

    const token = await genToken(user.id);

    const isSecure = process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      user: formatUserResponse(user),
      token,
      message: 'user created or logged in successfully',
      statusCode: 200,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `Google auth error ${error.message || error}`,
    });
  }
};

export const logOut = async (req: Request, res: Response): Promise<any> => {
  try {
    const isSecure = process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
    });
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
