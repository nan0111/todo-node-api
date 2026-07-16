/**
 * タスクコントローラー。
 * タスクのCRUD操作を処理する。
 */
import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/taskService';
import { Status } from '@prisma/client';

const getId = (params: Record<string, string | string[] | undefined>) => {
  const id = params.id;
  return typeof id === 'string' ? id : (id?.[0] ?? '');
};

export const taskController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await taskService.create(req.userId, req.body);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  },

  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, sortBy, page, limit } = req.query;
      const tasks = await taskService.findAll(
        req.userId,
        status as Status | undefined,
        sortBy as
          | 'titleAsc'
          | 'titleDesc'
          | 'dueDateAsc'
          | 'dueDateDesc'
          | 'createdAtAsc'
          | 'createdAtDesc'
          | undefined,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10,
      );
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await taskService.findById(req.userId, getId(req.params));
      if (!task) return res.status(404).json({ error: 'Task not found' });

      res.json(task);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await taskService.update(req.userId, getId(req.params), req.body);
      if (!task) return res.status(404).json({ error: 'Task not found' });

      res.json(task);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await taskService.delete(req.userId, getId(req.params));
      if (!task) return res.status(404).json({ error: 'Task not found' });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
