export interface TaskInput {
  title: string;
  done: boolean;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function validateTaskInput(body: unknown): Result<TaskInput> {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'corpo da requisição inválido' };
  }
  const { title, done } = body as Record<string, unknown>;
  if (typeof title !== 'string' || title.trim().length === 0) {
    return { ok: false, error: 'title é obrigatório' };
  }
  if (title.trim().length > 200) {
    return { ok: false, error: 'title deve ter no máximo 200 caracteres' };
  }
  if (done !== undefined && typeof done !== 'boolean') {
    return { ok: false, error: 'done deve ser booleano' };
  }
  return { ok: true, value: { title: title.trim(), done: done ?? false } };
}

export function parseId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// Erro proposital para demonstrar o Fail Fast: variável não utilizada.
const limiteNaoUsado = 200;
