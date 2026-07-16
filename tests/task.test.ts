import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import prisma from '../src/config/prisma';

jest.setTimeout(10000);

const JWT_SECRET = process.env.JWT_SECRET;

type JwtPayload = {
  userId: string;
};

const mockEmail1 = 'testaaaa@test.example.com';
const mockPass1 = 'pass1234';
const mockEmail2 = 'testbbbb@test.example.com';
const mockPass2 = 'pass5678';

let mockToken1: string;
let mockUserId1: string;
let mockToken2: string;
let mockUserId2: string;

describe('todo-api266 テスト', () => {
  if (!JWT_SECRET) {
    throw Error('SECRET error');
  }

  beforeAll(async () => {
    // DBデータクリーンアップ
    await prisma.task.deleteMany({
      where: {
        user: {
          email: {
            in: [mockEmail1, mockEmail2],
          },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [mockEmail1, mockEmail2],
        },
      },
    });
  });

  beforeEach(async () => {
    await prisma.task.deleteMany({
      where: {
        user: {
          email: {
            in: [mockEmail1, mockEmail2],
          },
        },
      },
    });
  });

  afterAll(async () => {
    // DBデータクリーンアップ
    await prisma.task.deleteMany({
      where: {
        user: {
          email: {
            in: [mockEmail1, mockEmail2],
          },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [mockEmail1, mockEmail2],
        },
      },
    });
  });

  /**
   * POST /auth (User 1) のテスト
   */
  describe('POST /auth/signup /auth/signin ユーザー1', () => {
    it('ユーザー1を作成＆ログインし、トークンからuserId取得できるか', async () => {
      // ユーザー作成
      const res1 = await request(app)
        .post('/auth/signup')
        .send({ email: mockEmail1, password: mockPass1 });

      expect(res1.status).toBe(201);

      // ログインしてトークン取得
      const res2 = await request(app)
        .post('/auth/signin')
        .send({ email: mockEmail1, password: mockPass1 });

      expect(res2.status).toBe(200);
      expect(res2.body).toHaveProperty('token');

      mockToken1 = res2.body.token;
      const decoded = jwt.verify(mockToken1, JWT_SECRET as string) as JwtPayload;

      expect(decoded.userId).toBeDefined();

      mockUserId1 = decoded.userId;
    });
  });

  /**
   * POST /auth (User 2) のテスト
   */
  describe('POST /auth/signup /auth/signin ユーザー2', () => {
    it('ユーザー2を作成＆ログインし、トークンからuserId取得できるか', async () => {
      // ユーザー作成
      const res1 = await request(app)
        .post('/auth/signup')
        .send({ email: mockEmail2, password: mockPass2 });

      expect(res1.status).toBe(201);

      // ログインしてトークン取得
      const res2 = await request(app)
        .post('/auth/signin')
        .send({ email: mockEmail2, password: mockPass2 });

      expect(res2.status).toBe(200);
      expect(res2.body).toHaveProperty('token');

      mockToken2 = res2.body.token;
      const decoded = jwt.verify(mockToken2, JWT_SECRET as string) as JwtPayload;

      expect(decoded.userId).toBeDefined();

      mockUserId2 = decoded.userId;
    });
  });

  /**
   * POST /tasks (タスク作成) のテスト
   */
  describe('POST /tasks', () => {
    it('ログイン状態で、タスクを作成できるか', async () => {
      const taskData = {
        title: 'テストタスク',
        description: 'インテグレーションテストの内容です',
      };

      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${mockToken1}`)
        .send(taskData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(taskData.title);
      expect(res.body.userId).toBe(mockUserId1);
    });

    it('未ログイン状態で、タスクを作成すると401エラーになるか', async () => {
      const res = await request(app).post('/tasks').send({ title: 'トークンなしタスク' });

      expect(res.status).toBe(401);
    });

    it('Zodバリデーションに違反した場合、400エラーになるか', async () => {
      const invalidData = { description: 'タイトルなしタスク' };

      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${mockToken1}`)
        .send(invalidData);

      expect(res.status).toBe(400); // Zodエラー
    });
  });

  /**
   * GET /tasks (タスク一覧) のテスト
   */
  describe('GET /tasks all', () => {
    beforeEach(async () => {
      // 該当ユーザーのテストデータを事前にDBへ投入
      const tasks = Array.from({ length: 25 }).map((_, i) => ({
        title: `タスク${i + 1}`,
        dueDate: new Date(2026, 0, 25 - i), // 日付は逆順に
        userId: mockUserId1,
      }));
      await prisma.task.createMany({ data: tasks });
      await prisma.task.create({
        data: {
          title: '他人のタスク',
          userId: mockUserId2,
        },
      });
    });

    it('自分のタスク25件を、全件取得できるか', async () => {
      const res = await request(app)
        .get('/tasks')
        .query({ page: 1, limit: 30 })
        .set('Authorization', `Bearer ${mockToken1}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(25);
    });

    it('ページネーションが機能しているか', async () => {
      const res1 = await request(app)
        .get('/tasks')
        .query({ sortBy: 'dueDateDesc', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${mockToken1}`);
      expect(res1.status).toBe(200);
      expect(res1.body.length).toBe(10);
      expect(res1.body[0].title).toBe('タスク1');
      expect(res1.body[9].title).toBe('タスク10');

      const res2 = await request(app)
        .get('/tasks')
        .query({ sortBy: 'dueDateDesc', page: 2, limit: 10 })
        .set('Authorization', `Bearer ${mockToken1}`);
      expect(res2.status).toBe(200);
      expect(res2.body.length).toBe(10);
      expect(res2.body[0].title).toBe('タスク11');
      expect(res2.body[9].title).toBe('タスク20');

      const res3 = await request(app)
        .get('/tasks')
        .query({ sortBy: 'dueDateDesc', page: 3, limit: 10 })
        .set('Authorization', `Bearer ${mockToken1}`);
      expect(res3.status).toBe(200);
      expect(res3.body.length).toBe(5);
      expect(res3.body[0].title).toBe('タスク21');
      expect(res3.body[4].title).toBe('タスク25');
    });

    it('ソート機能が機能しているか', async () => {
      const sorts = [
        { param: 'titleAsc', key: 'title', expected: 'タスク1' },
        { param: 'titleDesc', key: 'title', expected: 'タスク9' }, // 辞書順
        { param: 'dueDateAsc', key: 'dueDate', expected: '2026-01-01T00:00:00.000Z' },
        { param: 'dueDateDesc', key: 'dueDate', expected: '2026-01-25T00:00:00.000Z' },
      ];

      for (const sort of sorts) {
        const res = await request(app)
          .get('/tasks')
          .query({ sortBy: sort.param })
          .set('Authorization', `Bearer ${mockToken1}`);
        expect(res.status).toBe(200);
        if (sort.key === 'title') {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(10);
          expect(res.body[0].title).toBe(sort.expected);
        } else {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(10);
          expect(res.body[0].dueDate).toBe(sort.expected);
        }
      }

      for (const sort of sorts) {
        const res = await request(app)
          .get('/tasks')
          .query({ sortBy: sort.param, limit: 5 })
          .set('Authorization', `Bearer ${mockToken1}`);
        expect(res.status).toBe(200);
        if (sort.key === 'title') {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(5);
          expect(res.body[0].title).toBe(sort.expected);
        } else {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(5);
          expect(res.body[0].dueDate).toBe(sort.expected);
        }
      }
    });
  });

  describe('GET /tasks/:id', () => {
    it('自分のタスクをIDで取得できるか', async () => {
      const task = await prisma.task.create({
        data: { title: 'タスク1', userId: mockUserId1 },
      });

      const res = await request(app)
        .get(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${mockToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(task.id);
    });

    it('存在しないIDで取得すると404になるか', async () => {
      const res = await request(app)
        .get('/tasks/non-existent-id')
        .set('Authorization', `Bearer ${mockToken1}`);

      expect(res.status).toBe(404);
    });

    it('他人のタスクIDで取得すると404になるか', async () => {
      const task = await prisma.task.create({
        data: { title: '他人のタスク', userId: mockUserId2 },
      });

      const res = await request(app)
        .get(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${mockToken1}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('自分のタスクを更新できるか', async () => {
      const task = await prisma.task.create({
        data: { title: '古いタイトル', userId: mockUserId1 },
      });

      const res = await request(app)
        .patch(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${mockToken1}`)
        .send({ title: '新しいタイトル' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('新しいタイトル');
    });

    it('存在しないIDで更新すると404になるか', async () => {
      const res = await request(app)
        .patch('/tasks/non-existent-id')
        .set('Authorization', `Bearer ${mockToken1}`)
        .send({ title: '更新' });

      expect(res.status).toBe(404);
    });

    it('他人のタスクIDで更新すると404になるか', async () => {
      const task = await prisma.task.create({
        data: { title: '他人のタスク', userId: mockUserId2 },
      });

      const res = await request(app)
        .patch(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${mockToken1}`)
        .send({ title: '更新' });

      expect(res.status).toBe(404);
    });

    it('バリデーションエラー（不正なステータス）で400になるか', async () => {
      const task = await prisma.task.create({
        data: { title: 'タスク', userId: mockUserId1 },
      });

      const res = await request(app)
        .patch(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${mockToken1}`)
        .send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('自分のタスクを削除できるか', async () => {
      const task = await prisma.task.create({
        data: { title: '削除対象', userId: mockUserId1 },
      });

      const res = await request(app)
        .delete(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${mockToken1}`);

      expect(res.status).toBe(204);
      const deletedTask = await prisma.task.findUnique({
        where: { id: task.id },
      });
      expect(deletedTask).toBeNull();
    });

    it('存在しないIDで削除すると404になるか', async () => {
      const res = await request(app)
        .delete('/tasks/non-existent-id')
        .set('Authorization', `Bearer ${mockToken1}`);

      expect(res.status).toBe(404);
    });

    it('他人のタスクIDで削除すると404になるか', async () => {
      const task = await prisma.task.create({
        data: { title: '他人のタスク', userId: mockUserId2 },
      });

      const res = await request(app)
        .delete(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${mockToken1}`);

      expect(res.status).toBe(404);
    });
  });

  describe('認証ミドルウェアのテスト', () => {
    it('トークンなしでアクセスすると401になるか', async () => {
      const res = await request(app).get('/tasks');
      expect(res.status).toBe(401);
    });

    it('無効なトークンでアクセスすると401になるか', async () => {
      const res = await request(app)
        .get('/tasks')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });
});
