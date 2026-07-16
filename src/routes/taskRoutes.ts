/**
 * タスクルート定義。
 * タスクのCRUD操作に関するエンドポイントを定義する。
 */
import { Router } from 'express';
import { z } from 'zod';
import { Status } from '@prisma/client';
import { taskController } from '../controllers/taskController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';

const router = Router();

const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    dueDate: z.iso
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
  }),
});

const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    status: z.enum(Status).optional(),
    dueDate: z.iso
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
  }),
});

router.use(authMiddleware);

const findAllTaskSchema = z.object({
  query: z.object({
    status: z.enum(Status).optional(),
    sortBy: z
      .enum(['titleAsc', 'titleDesc', 'dueDateAsc', 'dueDateDesc', 'createdAtAsc', 'createdAtDesc'])
      .optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

router.post('/', validate(createTaskSchema), taskController.create);
router.get('/', validate(findAllTaskSchema), taskController.findAll);
router.get('/:id', taskController.findById);
router.patch('/:id', validate(updateTaskSchema), taskController.update);
router.delete('/:id', taskController.delete);

export default router;
