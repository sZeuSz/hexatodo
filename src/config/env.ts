import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  MONGODB_URI: z.url(),
  JWT_SECRET: z
    .string()
    .min(32, 'O segredo do JWT deve ter pelo menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.url(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error('Variáveis de ambiente invalidas', _env.error.issues);

  throw new Error('Variáveis de ambiente invalidas.');
}

export const env = _env.data;
