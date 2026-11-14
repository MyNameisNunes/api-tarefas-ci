import { createApp } from './app.js';
import { createPool, migrate } from './db.js';
import { createPgRepository } from './repository.js';

const pool = createPool();
await migrate(pool);

const port = Number(process.env.PORT ?? 3000);
createApp(createPgRepository(pool)).listen(port, () => {
  console.log(`API de tarefas ouvindo na porta ${port}`);
});
