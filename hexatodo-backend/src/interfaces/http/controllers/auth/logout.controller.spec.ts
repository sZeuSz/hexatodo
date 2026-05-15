import type { HttpRequest } from '../../ports/http-controller.js';
import { LogoutController } from './logout.controller.js';

const makeRequest = (overrides: Partial<HttpRequest> = {}): HttpRequest => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  cookies: {},
  user: undefined,
  ...overrides,
});

describe('LogoutController', () => {
  it('should return 200 with success message', async () => {
    const controller = new LogoutController();
    const response = await controller.handle(makeRequest());

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: 'Logout realizado com sucesso' });
  });

  it('should clear auth_token cookie', async () => {
    const controller = new LogoutController();
    const response = await controller.handle(makeRequest());

    expect(response.clearCookies).toContain('auth_token');
  });
});
