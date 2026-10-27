import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/connectDb';
export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
  userRole?: string;
  cookies: any;
  file?: any;
  files?: any;
}

interface JwtPayload {
  userId: string;
}

const isAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    const headerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const token = req.cookies?.token || headerToken;

    if (!token) {
      return res.status(401).json({
        message: 'Authentication token missing.',
        statusCode: 401,
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET missing in environment');
    }

    const verifyToken = jwt.verify(token, secret) as JwtPayload;
    if (!verifyToken || !verifyToken.userId) {
      return res.status(401).json({
        message: 'Invalid or expired authentication token.',
        statusCode: 401,
      });
    }

    req.userId = verifyToken.userId;

    // Fetch user role using Prisma
    const user = await prisma.user.findUnique({
      where: { id: verifyToken.userId },
    });

    if (user) {
      req.user = user;
      req.userRole = user.role || 'learner';
    } else {
      req.userRole = 'learner';
    }

    next();
  } catch (error: any) {
    return res.status(401).json({
      message: `Authentication error: ${error.message}`,
    });
  }
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        message: `Forbidden: Access restricted to ${allowedRoles.join(' or ')} role.`,
        statusCode: 403,
      });
    }
    next();
  };
};

export default isAuth;
