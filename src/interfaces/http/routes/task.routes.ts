import { Router } from 'express';
import { adaptRoute } from '../adapters/express.adapter.js';
import { makeCreateManyTasksController } from '../factories/task/make-create-many-tasks-controller.js';
import { makeCreateTaskController } from '../factories/task/make-create-task-controller.js';
import { makeDeleteTaskController } from '../factories/task/make-delete-task-controller.js';
import { makeGetTaskController } from '../factories/task/make-get-task-controller.js';
import { makeListTasksController } from '../factories/task/make-list-tasks-controller.js';
import { makeUpdateTaskController } from '../factories/task/make-update-task-controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const listTasks = adaptRoute(makeListTasksController());
const createTask = adaptRoute(makeCreateTaskController());
const createManyTasks = adaptRoute(makeCreateManyTasksController());
const getTask = adaptRoute(makeGetTaskController());
const updateTask = adaptRoute(makeUpdateTaskController());
const deleteTask = adaptRoute(makeDeleteTaskController());

export const taskRouter = Router();

taskRouter.use(authMiddleware);

taskRouter.get('/', listTasks);
taskRouter.post('/', createTask);
taskRouter.post('/bulk', createManyTasks);
taskRouter.get('/:id', getTask);
taskRouter.patch('/:id', updateTask);
taskRouter.delete('/:id', deleteTask);
