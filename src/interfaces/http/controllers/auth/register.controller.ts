import type { RegisterUseCase } from '@application/use-cases/auth/register.usecase.js';
import { z } from 'zod';
import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../ports/http-controller.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export class RegisterController implements HttpController {
  constructor(private readonly register: RegisterUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const { email, password } = registerSchema.parse(req.body);

    const user = await this.register.execute({ email, password });

    return {
      statusCode: 201,
      body: { id: user.id, email: user.email, createdAt: user.createdAt },
    };
  }
}
