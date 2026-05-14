import { Router } from 'express';
import { adaptRoute } from '../adapters/express.adapter.js';
import { makeCreateTaskController } from '../factories/make-create-task-controller.js';
import { makeListTasksController } from '../factories/make-list-tasks-controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const createTask = adaptRoute(makeCreateTaskController());
const listTasks = adaptRoute(makeListTasksController());

export const taskRouter = Router();

taskRouter.use(authMiddleware);

taskRouter.get('/', listTasks);
taskRouter.post('/', createTask);
