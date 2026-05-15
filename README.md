# hexaToDo — Backend

API REST para gerenciamento de tarefas construída sobre Arquitetura Hexagonal (Ports & Adapters) com TypeScript strict, Express 5 e MongoDB.

---

## Índice

- [Stack](#stack)
- [Por que MongoDB e não PostgreSQL](#por-que-mongodb-e-não-postgresql)
- [Arquitetura](#arquitetura)
- [Organização de Pastas](#organização-de-pastas)
- [Princípios de Design](#princípios-de-design)
- [Middlewares e Segurança](#middlewares-e-segurança)
- [Inicialização e Graceful Shutdown](#inicialização-e-graceful-shutdown)
- [Setup](#setup)

---

## Stack

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

---

## Por que MongoDB e não PostgreSQL

Não foi preguiça de configurar migrations :D

Tarefas são flexíveis. Um usuário quer adicionar tags, outro quer subtarefas, outro quer campos customizados. No relacional, cada variação vira uma migration e uma coluna nova. Com MongoDB, o documento simplesmente atende sem cerimônia.

O padrão de acesso também ajudou a decidir: toda query aqui parte de um `userId` isso quer dizer q não tem join, não tem agregação entre entidades, não tem relatório relacional. É basicamente "me dá as tarefas desse usuário" — exatamente o caso onde documento se sai bem sem overhead de schema rígido.

O bulk insert ajudou também. Criar até 1.000 tarefas de uma vez vira um `insertMany` com uma roundtrip ao banco. No PostgreSQL isso exigiria transação explícita ou uma abstração do ORM que tira o controle da sua mão.

Dito isso, se o domínio fosse outro — pagamentos, consistência forte entre entidades, relatórios complexos — PostgreSQL seria a escolha certa sem hesitar. Mas pra esse caso o MongoDB é a ferramenta certa.
---

## Arquitetura

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

---

## Princípios de Design

### Inversão de Dependência (DIP)

Nenhum use case ou entidade de domínio conhece Mongoose, Express ou qualquer biblioteca concreta. Eles dependem de interfaces (portas). As implementações concretas — `MongoTaskRepository`, `JwtTokenService` — ficam em `infrastructure/` e implementam essas interfaces.

Isso significa que trocar Mongoose por outro ORM, ou Express por Fastify, não toca no núcleo da aplicação.

### Injeção de Dependência

Dependências são injetadas via construtor, não instanciadas internamente. Um use case recebe o repositório que precisa — não sabe de qual banco vem. A composição acontece em factories (`makeXController`), mantendo o código de negócio completamente testável com mocks simples.

### Single Responsibility

Cada classe, função e arquivo tem uma razão para mudar. O middleware de autenticação só valida token. O error handler só traduz erros para HTTP. O mongoose client só gerencia conexão.

### Erros como Cidadãos de Domínio

`AppError` é a base. `TaskNotFoundException` e `UnauthorizedException` são erros com semântica de domínio — quem os lança não sabe que existe HTTP. O `errorMiddleware` na borda da aplicação faz a tradução para status code. Domínio fala a língua do negócio; a interface fala a língua do protocolo.

---

## Middlewares e Segurança

### Helmet

Configura automaticamente headers HTTP de segurança: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security` e outros. Primeira linha de defesa contra ataques comuns de browser.

### CORS

Configurado por ambiente: em desenvolvimento aceita qualquer origem (`*`), em produção restringe à `FRONTEND_URL` definida na env. Métodos permitidos são declarados explicitamente.

### Rate Limiting

Via `express-rate-limit`: 100 requisições por janela de 15 minutos por IP. Headers `RateLimit-*` padrão RFC 6585. Plugável em Redis store quando necessário escalar horizontalmente.

### Auth Middleware

Valida o JWT em toda rota protegida. Extrai o payload e popula `req.user` com `sub` (user ID) e `email`. Rotas sem o middleware são explicitamente públicas — o padrão é protegido.

### Global Error Handler

Último middleware do Express. Captura qualquer erro não tratado e traduz para resposta padronizada:

- `AppError` (e subclasses) → status code do domínio + mensagem
- `ZodError` → 422 com detalhes dos campos inválidos
- Qualquer outro → 500 genérico (sem vazar stack trace para o cliente)

### Request Logger

Captura método, rota, status code e latência em ms de cada requisição via evento `finish` do response. Em produção, Winston serializa como JSON — pesquisável por qualquer ferramenta de log aggregation.

---

## Inicialização e Graceful Shutdown

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

### Proteção contra falhas silenciosas

Handlers globais garantem que nenhum erro escapa sem ser logado e sem derrubar o processo de forma controlada:

- `unhandledRejection` — promise rejeitada sem `catch`
- `uncaughtException` — exceção fora do ciclo async (ex: `setTimeout`)

Em ambos os casos: loga o erro com contexto completo e encerra com `process.exit(1)`. O orquestrador (Docker, PM2, Kubernetes) pode reinicia o processo limpo. **Lembrando que processo em estado desconhecido é mais perigoso que processo reiniciando.**

---

## Setup

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

### Instalação

```bash
npm install
```

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

### Subir infraestrutura

MongoDB e Redis via Docker Compose:

```bash
docker compose up -d
```

### Desenvolvimento

```bash
npm run dev
```

### Verificar que está rodando

```bash
curl http://localhost:8000/ping
# { "message": "pong" }
```

### Testes

```bash
npm test           # executa a suíte completa
npm run test:watch # modo watch
npm run test:cov   # com cobertura
```

### Build para produção

```bash
npm run build
npm start
```
