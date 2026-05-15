import { jest } from '@jest/globals';

// Criamos um objeto mutável para que o mock mude dinamicamente em runtime
const mockEnv = { NODE_ENV: 'test' };

jest.unstable_mockModule('@config/env.js', () => ({
  env: mockEnv,
}));

describe('buildAuthCookie', () => {
  beforeEach(() => {
    // Reseta o cache de módulos isolados do Jest para reavaliar o cookie-builder
    jest.resetModules();
  });

  it('should return cookie with lax sameSite in non-production', async () => {
    mockEnv.NODE_ENV = 'test';

    // Importa dinamicamente para garantir que o arquivo leia o mock atualizado
    const { buildAuthCookie } = await import('./cookie-builder.js');
    const cookie = buildAuthCookie('jwt-token');

    expect(cookie.secure).toBe(false);
    expect(cookie.sameSite).toBe('lax');
  });

  it('should return cookie with strict sameSite and secure in production', async () => {
    mockEnv.NODE_ENV = 'production';

    const { buildAuthCookie } = await import('./cookie-builder.js');
    const cookie = buildAuthCookie('jwt-token');

    expect(cookie.secure).toBe(true);
    expect(cookie.sameSite).toBe('strict');
  });
});
