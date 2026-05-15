import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../../ports/http-controller.js';

export class LogoutController implements HttpController {
  async handle(_req: HttpRequest): Promise<HttpResponse> {
    return {
      statusCode: 200,
      body: { message: 'Logout realizado com sucesso' },
      clearCookies: ['auth_token'],
    };
  }
}
