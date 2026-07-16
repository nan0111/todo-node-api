/**
 * 認証コントローラー。
 * ユーザー登録とログインのリクエストを処理する。
 */
import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await authService.signUp(email, password);

    res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const token = await authService.signIn(email, password);

    res.json({ token });
  } catch (error) {
    next(error);
  }
};
