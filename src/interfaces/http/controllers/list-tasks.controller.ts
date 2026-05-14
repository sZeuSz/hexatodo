import type { ListTasksUseCase } from '@application/use-cases/task/list-tasks.usecase.js';
import { UnauthorizedException } from '@domain/errors/unauthorized.exception.js';
import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../ports/http-controller.js';

export class ListTasksController implements HttpController {
  constructor(private readonly listTasks: ListTasksUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    if (!req.user) throw new UnauthorizedException();

    const tasks = await this.listTasks.execute(req.user.sub);

    return { statusCode: 200, body: tasks };
  }
}
