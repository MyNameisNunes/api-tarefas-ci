import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import type { Task, TaskRepository } from '../../src/repository.js';

/** Repositório em memória: isola a camada HTTP do banco de dados. */
function memoryRepo(): TaskRepository {
  const tasks = new Map<number, Task>();
  let next = 1;
  return {
    async list() {
      return [...tasks.values()];
    },
    async get(id) {
      return tasks.get(id) ?? null;
    },
    async create(title, done) {
      const task = { id: next++, title, done, createdAt: new Date() };
      tasks.set(task.id, task);
      return task;
    },
    async update(id, title, done) {
      const task = tasks.get(id);
      if (!task) return null;
      const updated = { ...task, title, done };
      tasks.set(id, updated);
      return updated;
    },
    async remove(id) {
      return tasks.delete(id);
    },
  };
}

describe('API de tarefas (camada HTTP)', () => {
  let app: ReturnType<typeof createApp>;
  beforeEach(() => {
    app = createApp(memoryRepo());
  });

  it('GET /health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('POST /tasks cria uma tarefa', async () => {
    const res = await request(app).post('/tasks').send({ title: 'Nova' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, title: 'Nova', done: false });
  });

  it('POST /tasks retorna 400 para entrada inválida', async () => {
    const res = await request(app).post('/tasks').send({ title: '' });
    expect(res.status).toBe(400);
  });

  it('GET /tasks/:id retorna 404 para tarefa inexistente', async () => {
    const res = await request(app).get('/tasks/99');
    expect(res.status).toBe(404);
  });

  it('GET /tasks/:id retorna 400 para id inválido', async () => {
    const res = await request(app).get('/tasks/abc');
    expect(res.status).toBe(400);
  });
});
