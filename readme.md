# hexaToDo — Fullstack Task Management System

Este repositório contém a solução completa para o desafio técnico de gerenciamento de tarefas. A aplicação foi desenvolvida utilizando **TypeScript (Strict Mode)** em todo o ecossistema, aplicando rigorosamente os princípios da **Arquitetura Hexagonal (Ports & Adapters)**, alta coesão, baixo acoplamento e segurança por design.

---

## Estrutura do Monorepo

O projeto está organizado como um monorepo para facilitar o desenvolvimento e a orquestração do ambiente:

```text
hexatodo/
├── hexatodo-backend/     # API REST em Node.js (Express 5 + MongoDB)
├── hexatodo-frontend/    # SPA em React 19 (Vite + Tailwind CSS v4)
├── docker-compose.yml
└── readme.md
```

---

## Como rodar o projeto

### Opção 1 — Docker (recomendado)

Sobe tudo com um único comando: MongoDB, Redis, backend e frontend.

**Pré-requisito:** Docker e Docker Compose instalados.

```bash
# Clone o repositório
git clone https://github.com/sZeuSz/hexaToDo.git
cd hexaToDo
```

Crie um arquivo `.env` na raiz com o JWT_SECRET:

```env
JWT_SECRET=uma_chave_secreta_com_pelo_menos_32_caracteres
JWT_EXPIRES_IN=7d
```

```bash
# Sobe tudo
docker compose up --build
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:8000`

Para rodar em background:

```bash
docker compose up --build -d
docker compose logs -f   # acompanhar logs
docker compose down -v   # parar tudo e remover volumes
```

> Se o `docker compose down -v` travar por volumes em uso, rode `docker rm -f $(docker ps -aq)` para forçar a remoção de todos os containers e tente novamente.

---

### Opção 2 — Rodar manualmente

**Pré-requisitos:** Node.js 20+ e Docker (só para o MongoDB e Redis).

#### 1. Infraestrutura (MongoDB + Redis)

```bash
cd hexatodo-backend
docker compose up -d
```

#### 2. Backend

```bash
npm install
cp .env.example .env  # edite com os valores reais
npm run dev
```

#### 3. Frontend

```bash
cd ../hexatodo-frontend
npm install
npm run dev
```

O frontend roda em `http://localhost:5173` e o proxy do Vite redireciona `/api/*` para `http://localhost:8000` automaticamente.

---

### Testes

Os testes rodam localmente — a imagem Docker de produção não inclui devDependencies nem spec files. Necessário ter Node.js 20+ instalado.

#### Backend

```bash
cd hexatodo-backend
npm install
cp .env.example .env

npm test           # suíte completa
npm run test:watch # modo watch
npm run test:cov   # com relatório de cobertura
```

#### Frontend

```bash
cd hexatodo-frontend
npm install

npm test                # modo watch interativo
npm run test:coverage   # com relatório de cobertura
```

---

### Por que nginx no Docker?

Depois do `npm run build` o Vite gera só arquivos estáticos — alguém precisa servir isso via HTTP. O nginx faz esse papel.

Mas o motivo principal é o proxy. Em desenvolvimento o próprio Vite já redireciona `/api/*` para o backend. No Docker esse servidor do Vite não existe mais, então o browser chamaria `/api/...` e ninguém estaria escutando. O nginx assume esse papel: serve os arquivos estáticos e repassa qualquer chamada `/api` para o container do backend. Isso também evita CORS, já que frontend e API ficam no mesmo endereço.

---

## Backend — hexatodo-backend

API REST para gerenciamento de tarefas construída sobre Arquitetura Hexagonal (Ports & Adapters) com TypeScript strict, Express 5 e MongoDB.

### Stack

| Camada | Tecnologia | Motivo |
|---|---|---|
| Runtime | Node.js 24 + TypeScript strict | Tipagem total, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| Framework HTTP | Express 5 | Async nativo sem `express-async-errors`, API estável |
| Banco de dados | MongoDB via Mongoose | Ver seção abaixo |
| Validação de schema | Zod | Validação em runtime + inferência de tipos sem duplicação |
| Autenticação | JWT (jsonwebtoken) | Stateless, sem sessão server-side |
| Logging | Winston | JSON estruturado em produção, colorido em desenvolvimento |
| Variáveis de ambiente | Zod + `process.env` | Falha rápido na inicialização se env inválida |
| Dev server | tsx watch | Suporte nativo a ESM e path aliases via esbuild |
| Cache | Redis via ioredis | Cache de sessão e dados frequentes, porta abstraída no domínio |
| Rate limiting | express-rate-limit | Headers RFC 6585, plugável em Redis store para escala horizontal |

### Arquitetura

O projeto segue **Arquitetura Hexagonal (Ports & Adapters)** de forma estrita.

```
Mundo Externo (HTTP, Banco, etc.)
         │
         ▼
  [ Interfaces ]          ← Adapters de entrada: controllers, middlewares, rotas
         │
         ▼
  [ Application ]         ← Use cases: orquestram regras de negócio
         │
         ▼
  [ Domain ]              ← Entidades, erros de domínio, portas (interfaces/contratos)
         ▲
         │
  [ Infrastructure ]      ← Adapters de saída: Mongoose, serviços externos, etc
```

**A regra central:** nenhuma camada interna (`domain`, `application`) importa nada de uma camada externa (`infrastructure`, `interfaces`). A dependência sempre aponta para dentro. Isso é aplicado via path aliases — `@domain/*`, `@application/*`, `@infrastructure/*` — que tornam visível na leitura do código de qual camada o import vem. Sempre dependendo de abstrações, nunca de implementações.

Express é um detalhe de infraestrutura. O núcleo da aplicação não sabe que existe um servidor HTTP.

### Pipeline de Execução de Requisições

Cada requisição percorre obrigatoriamente o seguinte fluxo:

**REQUEST START:** Entrada HTTP via Express 5.

**MIDDLEWARES:** Validação de JWT e sanitização básica.

**CONTROLLER (Input Adapter):** Validação de Schema (Zod) e mapeamento dos dados da Request para o DTO do Usecase.

**USE CASE (Application):** Orquestração da regra de negócio. O Usecase deve depender de Interfaces (Ports), nunca de implementações concretas.

**REPOSITORY (Output Adapter):** Implementação do Banco de Dados (Prisma/Mongoose).

**RESPONSE:** Retorno padronizado ao cliente.

### Princípios de Design

#### Inversão de Dependência (DIP)

Nenhum use case ou entidade de domínio conhece Mongoose, Express ou qualquer biblioteca concreta. Eles dependem de interfaces (portas). As implementações concretas — `MongoTaskRepository`, `JwtTokenService` — ficam em `infrastructure/` e implementam essas interfaces.

Isso significa que trocar Mongoose por outro ORM, ou Express por Fastify, não toca no núcleo da aplicação.

#### Injeção de Dependência

Dependências são injetadas via construtor, não instanciadas internamente. Um use case recebe o repositório que precisa — não sabe de qual banco vem. A composição acontece em factories (`makeXController`), mantendo o código de negócio completamente testável com mocks simples.

#### Single Responsibility

Cada classe, função e arquivo tem uma razão para mudar. O middleware de autenticação só valida token. O error handler só traduz erros para HTTP. O mongoose client só gerencia conexão.

#### Erros como Cidadãos de Domínio

`AppError` é a base. `TaskNotFoundException` e `UnauthorizedException` são erros com semântica de domínio — quem os lança não sabe que existe HTTP. O `errorMiddleware` na borda da aplicação faz a tradução para status code. Domínio fala a língua do negócio; a interface fala a língua do protocolo.

### Middlewares e Segurança

#### Helmet

Configura automaticamente headers HTTP de segurança: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security` e outros. Primeira linha de defesa contra ataques comuns de browser.

#### CORS

Configurado por ambiente: em desenvolvimento aceita qualquer origem (`*`), em produção restringe à `FRONTEND_URL` definida na env. Métodos permitidos são declarados explicitamente.

#### Rate Limiting

Via `express-rate-limit`: 100 requisições por janela de 15 minutos por IP. Headers `RateLimit-*` padrão RFC 6585. Plugável em Redis store quando necessário escalar horizontalmente.

#### Auth Middleware

Valida o JWT em toda rota protegida. Extrai o payload e popula `req.user` com `sub` (user ID) e `email`. Rotas sem o middleware são explicitamente públicas — o padrão é protegido.

#### Global Error Handler

Último middleware do Express. Captura qualquer erro não tratado e traduz para resposta padronizada:

- `AppError` (e subclasses) → status code do domínio + mensagem
- `ZodError` → 422 com detalhes dos campos inválidos
- Qualquer outro → 500 genérico (sem vazar stack trace para o cliente)

#### Request Logger

Captura método, rota, status code e latência em ms de cada requisição via evento `finish` do response. Em produção, Winston serializa como JSON — pesquisável por qualquer ferramenta de log aggregation.

### Inicialização e Graceful Shutdown

`server.ts` orquestra o bootstrap em ordem:

1. Conecta ao MongoDB (`connectMongoose`)
2. Conecta ao Redis (`redis.connect`)
3. Abre o servidor HTTP (`app.listen`)
4. Registra handlers para `SIGTERM` e `SIGINT`

No shutdown, a sequência é invertida e controlada:

1. Para de aceitar novas conexões (`server.close`)
2. Aguarda requests em andamento terminarem
3. Desconecta do MongoDB e do Redis
4. Encerra o processo com código 0

Isso garante que um deploy ou reinicialização de container não corta conexões ativas nem deixa o banco em estado inconsistente.

#### Proteção contra falhas silenciosas

Handlers globais garantem que nenhum erro escapa sem ser logado e sem derrubar o processo de forma controlada:

- `unhandledRejection` — promise rejeitada sem `catch`
- `uncaughtException` — exceção fora do ciclo async (ex: `setTimeout`)

Em ambos os casos: loga o erro com contexto completo e encerra com `process.exit(1)`. O orquestrador (Docker, PM2, Kubernetes) pode reiniciar o processo limpo. **Lembrando que processo em estado desconhecido é mais perigoso que processo reiniciando.**

### Endpoints

#### Auth (público)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Cria conta. Body: `{ email, password }` |
| `POST` | `/api/auth/login` | Autentica. Body: `{ email, password }`. Retorna `{ token }` |

#### Tasks (requer `Authorization: Bearer <token>`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/tasks` | Lista tarefas paginadas. Query: `?page=1&limit=20` |
| `POST` | `/api/tasks` | Cria uma tarefa. Body: `{ title, description? }` |
| `POST` | `/api/tasks/bulk` | Cria até 1000 tarefas. Body: `{ tasks: [{ title, description? }] }` |
| `GET` | `/api/tasks/:id` | Busca tarefa por id |
| `PATCH` | `/api/tasks/:id` | Atualiza tarefa. Body: `{ title?, description?, completed? }` |
| `DELETE` | `/api/tasks/:id` | Remove tarefa |

### Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite `.env` com os valores reais. O servidor não inicializa se alguma variável obrigatória estiver ausente ou inválida.

```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hexatodo
JWT_SECRET=minimum_32_characters_secret_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
```

### Decisões Técnicas

#### Por que MongoDB e não PostgreSQL

Não foi preguiça de configurar migrations :D

Tarefas são flexíveis. Um usuário quer adicionar tags, outro quer subtarefas, outro quer campos customizados. No relacional, cada variação vira uma migration e uma coluna nova. Com MongoDB, o documento simplesmente atende sem cerimônia.

O padrão de acesso também ajudou a decidir: toda query aqui parte de um `userId` isso quer dizer q não tem join, não tem agregação entre entidades, não tem relatório relacional. É basicamente "me dá as tarefas desse usuário" — exatamente o caso onde documento se sai bem.

O bulk insert ajudou também. Criar até 1.000 tarefas de uma vez vira um `insertMany` com uma roundtrip ao banco. No PostgreSQL isso exigiria transação explícita ou uma abstração do ORM que tira o controle (até oonde eu imaginei).

Dito isso, se o domínio fosse outro — pagamentos, consistência forte entre entidades, relatórios complexos — PostgreSQL seria a escolha certa sem hesitar. Mas pra esse caso o MongoDB é a ferramenta certa.

#### Paginação: offset vs cursor

A paginação da listagem de tarefas usa `skip/limit` (offset-based). No PostgreSQL isso é um problema real — o banco faz full scan até a posição, então `OFFSET 10.000` lê 10.000 linhas só para descartá-las.

No MongoDB o comportamento é diferente: com o compound index `{ userId: 1, _id: 1 }` que está definido no model, o `skip()` opera diretamente no índice sem tocar nos documentos. O custo é bem menor e irrelevante para o volume esperado nesse domínio.

A alternativa seria cursor-based pagination (`?cursor=lastId`), que escala infinitamente mas adiciona complexidade na implementação e no cliente. Para esse desafio, eu optei por offset com índice composto mas eu sei desse problema.

#### Bulk insert: atomicidade no MongoDB

O endpoint `POST /api/tasks/bulk` usa `insertMany` do Mongoose. No MongoDB, `insertMany` é atômico por documento — cada documento é inserido ou não, sem estado parcial por documento. Isso é suficiente para o caso de uso aqui.

Diferente do PostgreSQL onde seria necessária uma transação explícita (`BEGIN/COMMIT`) para garantir que todos os registros entrem juntos ou nenhum entre. Nesse caso só se fosse realmente necessario no mongo como se as tarefas dependecem entre elas (que náo é o caso).

#### Estratégia de testes nos Use Cases

Os use cases foram testados com mocks tipados contra as interfaces de repositório (`jest.Mocked<TaskRepository>`), nunca contra implementações concretas. Essa abordagem garante que a regra de negócio está isolada de qualquer detalhe de infraestrutura — o teste valida o contrato do port, não o comportamento do MongoDB. Os testes continuam passando independente de qual adapter de banco for plugado no futuro.

### Testes

```bash
npm test           # executa a suíte completa
npm run test:watch # modo watch
npm run test:cov   # com cobertura
```

---

## Frontend — hexatodo-frontend

Aplicação de gerenciamento de tarefas construída com **React 19 + Vite + TypeScript**, seguindo arquitetura **Feature-Based** e princípios de **Arquitetura Hexagonal**.

### Tecnologias

| Tecnologia | Versão | Por quê |
|---|---|---|
| React 19 | `^19.2` | Biblioteca de UI moderna, sem overhead de framework |
| Vite | `^8` | Build tool ultrarrápido com HMR nativo e proxy de dev integrado |
| TypeScript (strict) | `~6.0` | Segurança de tipos em todo o projeto, conforme exigido no desafio |
| Tailwind CSS v4 | `^4.3` | Utilitários CSS com a nova API `@import "tailwindcss"` sem config extra |
| SWR | `^2.4` | Gerenciamento de estado do servidor com cache, revalidação e UI otimista |
| Vitest | `^4.1` | Suite de testes compatível com Vite, sem configuração adicional |
| React Testing Library | `^16.3` | Testes orientados a comportamento do usuário, não implementação |

### Arquitetura

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

#### Por que Feature-Based e não por tipo?

Agrupa o código pelo domínio (`tasks`), facilitando que cada feature seja desenvolvida, testada e removida de forma isolada — princípio da separação por contexto delimitado, análogo ao DDD.

#### Por que Context API e não Zustand/Redux?

O estado global atual é mínimo: apenas `email` e `isAuthenticated`. Context + `useCallback` resolve sem dependência extra.

**Quando migrar:** se surgir estado compartilhado entre múltiplas features (ex.: notificações, preferências do usuário, filtros globais), substituir AuthContext por Zustand ou Redux Toolkit para ganhar `devtools`, `persist` e seletores eficientes.

#### Segurança de autenticação

- O JWT vive exclusivamente em **cookie HttpOnly** (definido pelo backend).
- O frontend **nunca lê nem armazena o token** — só `email` no `localStorage`.
- Todas as requisições usam `credentials: 'include'`, enviando o cookie automaticamente.
- Evento `auth:unauthorized` desconecta o usuário em qualquer 401.

#### Estado do servidor com SWR

SWR gerencia o cache das tarefas com UI otimista: a tela atualiza instantaneamente enquanto a requisição é enviada em segundo plano, com rollback automático em caso de erro.

### Testes

```bash
npm test        # executa a suíte completa
npm run build   # build de produção
```

---

## Autor

Roseno Silva
