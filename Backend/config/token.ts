import jwt from 'jsonwebtoken';

const genToken = async (userId: string): Promise<string> => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const token = jwt.sign({ userId }, secret, {
      expiresIn: '7d',
    });
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
};

export default genToken;
