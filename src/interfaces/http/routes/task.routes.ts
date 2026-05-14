import { Router } from 'express';
import { adaptRoute } from '../adapters/express.adapter.js';
import { makeCreateTaskController } from '../factories/make-create-task-controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const createTask = adaptRoute(makeCreateTaskController());

export const taskRouter = Router();

taskRouter.use(authMiddleware);

taskRouter.post('/', createTask);
