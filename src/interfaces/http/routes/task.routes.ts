import { Router } from 'express';
import { adaptRoute } from '../adapters/express.adapter.js';
import { makeCreateTaskController } from '../factories/make-create-task-controller.js';
import { makeDeleteTaskController } from '../factories/make-delete-task-controller.js';
import { makeGetTaskController } from '../factories/make-get-task-controller.js';
import { makeListTasksController } from '../factories/make-list-tasks-controller.js';
import { makeUpdateTaskController } from '../factories/make-update-task-controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const listTasks = adaptRoute(makeListTasksController());
const createTask = adaptRoute(makeCreateTaskController());
const getTask = adaptRoute(makeGetTaskController());
const updateTask = adaptRoute(makeUpdateTaskController());
const deleteTask = adaptRoute(makeDeleteTaskController());

export const taskRouter = Router();

taskRouter.use(authMiddleware);

taskRouter.get('/', listTasks);
taskRouter.post('/', createTask);
taskRouter.get('/:id', getTask);
taskRouter.patch('/:id', updateTask);
taskRouter.delete('/:id', deleteTask);
