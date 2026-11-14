import type { Pool } from 'pg';

export interface Task {
  id: number;
  title: string;
  done: boolean;
  createdAt: Date;
}

export interface TaskRepository {
  list(): Promise<Task[]>;
  get(id: number): Promise<Task | null>;
  create(title: string, done: boolean): Promise<Task>;
  update(id: number, title: string, done: boolean): Promise<Task | null>;
  remove(id: number): Promise<boolean>;
}

const COLUMNS = 'id, title, done, created_at AS "createdAt"';

/** Repositório SQL: todas as consultas são parametrizadas ($1, $2...). */
export function createPgRepository(pool: Pool): TaskRepository {
  return {
    async list() {
      const r = await pool.query<Task>(
        `SELECT ${COLUMNS} FROM tasks ORDER BY id`,
      );
      return r.rows;
    },
    async get(id) {
      const r = await pool.query<Task>(
        `SELECT ${COLUMNS} FROM tasks WHERE id = $1`,
        [id],
      );
      return r.rows[0] ?? null;
    },
    async create(title, done) {
      const r = await pool.query<Task>(
        `INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING ${COLUMNS}`,
        [title, done],
      );
      return r.rows[0];
    },
    async update(id, title, done) {
      const r = await pool.query<Task>(
        `UPDATE tasks SET title = $2, done = $3 WHERE id = $1 RETURNING ${COLUMNS}`,
        [id, title, done],
      );
      return r.rows[0] ?? null;
    },
    async remove(id) {
      const r = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
      return (r.rowCount ?? 0) > 0;
    },
  };
}
