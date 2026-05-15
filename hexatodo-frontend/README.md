# hexaToDo — Frontend React

Aplicação de gerenciamento de tarefas construída com **React 19 + Vite + TypeScript**, seguindo arquitetura **Feature-Based** e princípios de **Arquitetura Hexagonal**.

## Tecnologias

| Tecnologia | Versão | Por quê |
|---|---|---|
| React 19 | `^19.2` | Biblioteca de UI moderna, sem overhead de framework |
| Vite | `^8` | Build tool ultrarrápido com HMR nativo e proxy de dev integrado |
| TypeScript (strict) | `~6.0` | Segurança de tipos em todo o projeto, conforme exigido no desafio |
| Tailwind CSS v4 | `^4.3` | Utilitários CSS com a nova API `@import "tailwindcss"` sem config extra |
| SWR | `^2.4` | Gerenciamento de estado do servidor com cache, revalidação e UI otimista |
| Vitest | `^4.1` | Suite de testes compatível com Vite, sem configuração adicional |
| React Testing Library | `^16.3` | Testes orientados a comportamento do usuário, não implementação |

## Arquitetura

```
src/
├── components/          # Componentes globais (Header, LoginForm)
├── context/             # Estado de autenticação (AuthContext)
├── features/
│   └── tasks/
│       ├── components/  # TaskForm, TaskItem, TaskList, BulkImportForm
│       ├── hooks/       # useTasks — lógica de negócio + SWR
│       ├── services/    # taskService, authService — adapters HTTP
│       ├── types/       # Task, PaginatedTasksResponse, DTOs
│       └── TasksPage.tsx
├── lib/
│   └── fetcher.ts       # Fetcher base com credentials: 'include'
└── __tests__/           # Testes unitários
```

### Por que Feature-Based e não por tipo?

Agrupa o código pelo domínio (`tasks`), facilitando que cada feature seja desenvolvida, testada e removida de forma isolada — princípio da separação por contexto delimitado, análogo ao DDD.

### Por que Context API e não Zustand/Redux?

O estado global atual é mínimo: apenas `email` e `isAuthenticated`. Context + `useCallback` resolve sem dependência extra.

**Quando migrar:** se surgir estado compartilhado entre múltiplas features (ex.: notificações, preferências do usuário, filtros globais), substituir AuthContext por Zustand ou Redux Toolkit para ganhar `devtools`, `persist` e seletores eficientes.

### Segurança de autenticação

- O JWT vive exclusivamente em **cookie HttpOnly** (definido pelo backend).
- O frontend **nunca lê nem armazena o token** — só `email` no `localStorage`.
- Todas as requisições usam `credentials: 'include'`, enviando o cookie automaticamente.
- Evento `auth:unauthorized` desconecta o usuário em qualquer 401.

### Estado do servidor com SWR

SWR gerencia o cache das tarefas com UI otimista: a tela atualiza instantaneamente enquanto a requisição é enviada em segundo plano, com rollback automático em caso de erro.

## Como executar

```bash
# Instalar dependências
npm install

# Iniciar dev server (backend deve estar em :8000)
npm run dev

# Rodar testes
npm test

# Build de produção
npm run build
```

## Variáveis de ambiente

Nenhuma variável de ambiente é necessária no frontend. O proxy do Vite redireciona `/api/*` para `http://localhost:8000` automaticamente em desenvolvimento.

## Autor

Roseno Silva
