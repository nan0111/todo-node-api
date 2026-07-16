/**
 * タスクサービス。
 * タスクのCRUD操作のビジネスロジックを管理する。
 */
import prisma from '../config/prisma';
import { Status } from '@prisma/client';

export const taskService = {
  create: async (userId: string, data: { title: string; description?: string; dueDate?: Date }) =>
    await prisma.task.create({ data: { ...data, userId } }),

  findAll: async (
    userId: string,
    status?: Status,
    sortBy?:
      | 'titleAsc'
      | 'titleDesc'
      | 'dueDateAsc'
      | 'dueDateDesc'
      | 'createdAtAsc'
      | 'createdAtDesc',
    page: number = 1,
    limit: number = 10,
  ) => {
    const orderBy = {
      titleAsc: { title: 'asc' as const },
      titleDesc: { title: 'desc' as const },
      dueDateAsc: { dueDate: 'asc' as const },
      dueDateDesc: { dueDate: 'desc' as const },
      createdAtAsc: { createdAt: 'asc' as const },
      createdAtDesc: { createdAt: 'desc' as const },
    }[sortBy ?? 'createdAtDesc'];

    return await prisma.task.findMany({
      where: { userId, status },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });
  },

  findById: async (userId: string, id: string) =>
    await prisma.task.findFirst({ where: { id, userId } }),

  update: async (
    userId: string,
    id: string,
    data: { title?: string; status?: Status; dueDate?: Date },
  ) => {
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) return null;

    return prisma.task.update({ where: { id }, data });
  },

  delete: async (userId: string, id: string) => {
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) return null;

    return prisma.task.delete({ where: { id } });
  },
};
