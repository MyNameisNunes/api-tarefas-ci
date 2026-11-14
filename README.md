# API de Tarefas com CI no GitHub Actions

[![CI](https://github.com/MyNameisNunes/api-tarefas-ci/actions/workflows/ci.yml/badge.svg)](https://github.com/MyNameisNunes/api-tarefas-ci/actions/workflows/ci.yml)

API REST (Node.js 24, TypeScript, Express) com banco de dados SQL (PostgreSQL),
usada para demonstrar um pipeline de Integração Contínua no GitHub Actions.

Autor: Thiago Nunes Alves do Prado

## Endpoints

| Método | Rota       | Descrição            |
| ------ | ---------- | -------------------- |
| GET    | /health    | Verificação de saúde |
| GET    | /tasks     | Lista as tarefas     |
| GET    | /tasks/:id | Busca uma tarefa     |
| POST   | /tasks     | Cria uma tarefa      |
| PUT    | /tasks/:id | Atualiza uma tarefa  |
| DELETE | /tasks/:id | Remove uma tarefa    |

## Pipeline de CI (`.github/workflows/ci.yml`)

Disparado em todo Pull Request para `main`, na ordem Fail Fast:

1. Análise estática (ESLint + eslint-plugin-security), formatação (Prettier) e tipos (tsc)
2. Análise estática de segurança (CodeQL + npm audit)
3. Build (TypeScript)
4. Testes unitários (Vitest) e de integração (API + PostgreSQL)
5. Criação da imagem Docker (push no GHCR com tag do SHA do commit)

## Executar localmente

```bash
npm ci
docker run -d --name pg -e POSTGRES_USER=app -e POSTGRES_PASSWORD=app -e POSTGRES_DB=app_test -p 5432:5432 postgres:17-alpine
export DATABASE_URL=postgresql://app:app@localhost:5432/app_test
npm run lint && npm run format:check && npm run build
npm run test:unit && npm run test:integration
npm start
```
