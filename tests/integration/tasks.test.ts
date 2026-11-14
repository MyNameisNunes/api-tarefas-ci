import type pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import { createPool, migrate } from '../../src/db.js';
import { createPgRepository } from '../../src/repository.js';

/** Testes de integração: API + PostgreSQL real (DATABASE_URL). */
describe('API de tarefas + PostgreSQL', () => {
  let pool: pg.Pool;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    pool = createPool();
    await migrate(pool);
    app = createApp(createPgRepository(pool));
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE tasks RESTART IDENTITY');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('cria, lista, atualiza e remove uma tarefa no banco', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Configurar pipeline' });
    expect(created.status).toBe(201);
    const id = created.body.id;

    const list = await request(app).get('/tasks');
    expect(list.body).toHaveLength(1);

    const updated = await request(app)
      .put(`/tasks/${id}`)
      .send({ title: 'Configurar pipeline', done: true });
    expect(updated.body.done).toBe(true);

    const row = await pool.query('SELECT done FROM tasks WHERE id = $1', [id]);
    expect(row.rows[0].done).toBe(true);

    expect((await request(app).delete(`/tasks/${id}`)).status).toBe(204);
    expect((await request(app).get(`/tasks/${id}`)).status).toBe(404);
  });

  it('persiste o título com aspas sem permitir SQL injection', async () => {
    const title = "x'); DROP TABLE tasks; --";
    const res = await request(app).post('/tasks').send({ title });
    expect(res.status).toBe(201);
    const count = await pool.query('SELECT COUNT(*)::int AS n FROM tasks');
    expect(count.rows[0].n).toBe(1);
  });
});
