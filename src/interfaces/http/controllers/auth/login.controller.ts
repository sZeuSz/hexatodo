import type { LoginUseCase } from '@application/use-cases/auth/login.usecase.js';
import { z } from 'zod';
import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../../ports/http-controller.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class LoginController implements HttpController {
  constructor(private readonly login: LoginUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const { email, password } = loginSchema.parse(req.body);

    const result = await this.login.execute({ email, password });

    return { statusCode: 200, body: result };
  }
}
