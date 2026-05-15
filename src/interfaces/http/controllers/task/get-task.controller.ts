import type { GetTaskUseCase } from '@application/use-cases/task/get-task.usecase.js';
import { UnauthorizedException } from '@domain/errors/unauthorized.exception.js';
import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../../ports/http-controller.js';

export class GetTaskController implements HttpController {
  constructor(private readonly getTask: GetTaskUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    if (!req.user) throw new UnauthorizedException();

    const task = await this.getTask.execute(req.params['id']!, req.user.sub);

    return { statusCode: 200, body: task };
  }
}
