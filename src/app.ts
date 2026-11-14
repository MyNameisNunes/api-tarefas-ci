import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import type { TaskRepository } from './repository.js';
import { parseId, validateTaskInput } from './validation.js';

export function createApp(repo: TaskRepository) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/tasks', async (_req, res) => {
    res.json(await repo.list());
  });

  app.get('/tasks/:id', async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'id inválido' });
      return;
    }
    const task = await repo.get(id);
    if (!task) {
      res.status(404).json({ error: 'tarefa não encontrada' });
      return;
    }
    res.json(task);
  });

  app.post('/tasks', async (req, res) => {
    const input = validateTaskInput(req.body);
    if (!input.ok) {
      res.status(400).json({ error: input.error });
      return;
    }
    const task = await repo.create(input.value.title, input.value.done);
    res.status(201).json(task);
  });

  app.put('/tasks/:id', async (req, res) => {
    const id = parseId(req.params.id);
    const input = validateTaskInput(req.body);
    if (id === null || !input.ok) {
      res.status(400).json({ error: input.ok ? 'id inválido' : input.error });
      return;
    }
    const task = await repo.update(id, input.value.title, input.value.done);
    if (!task) {
      res.status(404).json({ error: 'tarefa não encontrada' });
      return;
    }
    res.json(task);
  });

  app.delete('/tasks/:id', async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'id inválido' });
      return;
    }
    const removed = await repo.remove(id);
    res.status(removed ? 204 : 404).end();
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'erro interno' });
  });

  return app;
}
