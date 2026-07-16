/**
 * 認証サービス。
 * ユーザー登録とログインのビジネスロジックを管理する。
 */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

export const signUp = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) throw new Error('Email already exists');

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: { email, password: hashedPassword },
  });
};

export const signIn = async (email: string, password: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error('Invalid credentials');

  return jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });
};
