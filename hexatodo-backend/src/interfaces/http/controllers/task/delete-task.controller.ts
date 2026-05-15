import type { DeleteTaskUseCase } from '@application/use-cases/task/delete-task.usecase.js';
import { UnauthorizedException } from '@domain/errors/unauthorized.exception.js';
import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../../ports/http-controller.js';

export class DeleteTaskController implements HttpController {
  constructor(private readonly deleteTask: DeleteTaskUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    if (!req.user) throw new UnauthorizedException();

    await this.deleteTask.execute(req.params['id']!, req.user.sub);

    return { statusCode: 204, body: null };
  }
}
