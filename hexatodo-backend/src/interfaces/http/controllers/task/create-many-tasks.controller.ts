import type { CreateManyTasksUseCase } from '@application/use-cases/task/create-many-tasks.usecase.js';
import { UnauthorizedException } from '@domain/errors/unauthorized.exception.js';
import { z } from 'zod';
import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../../ports/http-controller.js';

const createManyTasksSchema = z.object({
  tasks: z
    .array(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().max(1000).optional(),
      }),
    )
    .min(1),
});

export class CreateManyTasksController implements HttpController {
  constructor(private readonly createManyTasks: CreateManyTasksUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    if (!req.user) throw new UnauthorizedException();

    const { tasks } = createManyTasksSchema.parse(req.body);

    const dtos = tasks.map((task) => ({
      title: task.title,
      ...(task.description !== undefined && { description: task.description }),
      userId: req.user!.sub,
    }));

    const created = await this.createManyTasks.execute(dtos);

    return { statusCode: 201, body: created };
  }
}
