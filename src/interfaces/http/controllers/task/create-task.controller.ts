import { z } from 'zod';
import type { CreateTaskUseCase } from '@application/use-cases/task/create-task.usecase.js';
import { UnauthorizedException } from '@domain/errors/unauthorized.exception.js';
import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../../ports/http-controller.js';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(255),
  description: z.string().max(1000).optional(),
});

export class CreateTaskController implements HttpController {
  constructor(private readonly createTask: CreateTaskUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    if (!req.user) throw new UnauthorizedException();

    const { title, description } = createTaskSchema.parse(req.body);

    const task = await this.createTask.execute({
      title,
      ...(description !== undefined && { description }),
      userId: req.user.sub,
    });

    return { statusCode: 201, body: task };
  }
}
