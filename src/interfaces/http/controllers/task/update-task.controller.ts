import type { UpdateTaskUseCase } from '@application/use-cases/task/update-task.usecase.js';
import { UnauthorizedException } from '@domain/errors/unauthorized.exception.js';
import type { UpdateTaskDTO } from '@domain/ports/entities/task.entity.js';
import { z } from 'zod';
import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../../ports/http-controller.js';

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  completed: z.boolean().optional(),
});

export class UpdateTaskController implements HttpController {
  constructor(private readonly updateTask: UpdateTaskUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    if (!req.user) throw new UnauthorizedException();

    const data = updateTaskSchema.parse(req.body) as UpdateTaskDTO;
    const task = await this.updateTask.execute(
      req.params['id']!,
      req.user.sub,
      data,
    );

    return { statusCode: 200, body: task };
  }
}
