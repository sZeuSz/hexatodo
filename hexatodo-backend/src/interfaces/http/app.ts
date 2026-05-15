import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';
import { env } from '../../config/env.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { rateLimiter } from './middlewares/rate-limite.middlware.js';
import { requestLoggerMiddleware } from './middlewares/request-logger.middleware.js';
import { authRouter } from './routes/auth.routes.js';
import { taskRouter } from './routes/task.routes.js';

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(rateLimiter);
app.use(requestLoggerMiddleware);

app.get('/ping', (_req, res) => {
  res.status(200).json({ message: 'pong' });
});

app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);

app.use(errorMiddleware);

export { app };
