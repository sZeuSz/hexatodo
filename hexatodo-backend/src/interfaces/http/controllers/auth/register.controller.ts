import type { LoginUseCase } from '@application/use-cases/auth/login.usecase.js';
import type { RegisterUseCase } from '@application/use-cases/auth/register.usecase.js';
import { z } from 'zod';
import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../../ports/http-controller.js';
import { buildAuthCookie } from './cookie-builder.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export class RegisterController implements HttpController {
  constructor(
    private readonly register: RegisterUseCase,
    private readonly login: LoginUseCase,
  ) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const { email, password } = registerSchema.parse(req.body);

    await this.register.execute({ email, password });

    // auto-login após registro para emitir o cookie
    const { token } = await this.login.execute({ email, password });

    return {
      statusCode: 201,
      body: { email },
      cookies: [buildAuthCookie(token)],
    };
  }
}
