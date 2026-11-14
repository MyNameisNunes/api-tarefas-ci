import { describe, expect, it } from 'vitest';
import { parseId, validateTaskInput } from '../../src/validation.js';

describe('validateTaskInput', () => {
  it('aceita um título válido e assume done = false', () => {
    expect(validateTaskInput({ title: '  Estudar CI  ' })).toEqual({
      ok: true,
      value: { title: 'Estudar CI', done: false },
    });
  });

  it('rejeita corpo ausente', () => {
    expect(validateTaskInput(null).ok).toBe(false);
  });

  it('rejeita título vazio', () => {
    expect(validateTaskInput({ title: '   ' })).toEqual({
      ok: false,
      error: 'title é obrigatório',
    });
  });

  it('rejeita título com mais de 200 caracteres', () => {
    expect(validateTaskInput({ title: 'a'.repeat(201) }).ok).toBe(false);
  });

  it('rejeita done não booleano', () => {
    expect(validateTaskInput({ title: 'x', done: 'sim' }).ok).toBe(false);
  });
});

describe('parseId', () => {
  it('converte ids numéricos positivos', () => {
    expect(parseId('42')).toBe(42);
  });

  it.each(['0', '-1', 'abc', '1.5', ''])('rejeita "%s"', (raw) => {
    expect(parseId(raw)).toBeNull();
  });
});
