import type { ListTasksUseCase } from '@application/use-cases/task/list-tasks.usecase.js';
import { UnauthorizedException } from '@domain/errors/unauthorized.exception.js';
import { z } from 'zod';
import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../../ports/http-controller.js';

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export class ListTasksController implements HttpController {
  constructor(private readonly listTasks: ListTasksUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    if (!req.user) throw new UnauthorizedException();

    const { page, limit } = paginationSchema.parse(req.query);
    const result = await this.listTasks.execute(req.user.sub, { page, limit });

    return { statusCode: 200, body: result };
  }
}
