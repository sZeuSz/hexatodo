import { env } from '@config/env.js';
import type { ResponseCookie } from '../../ports/http-controller.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function buildAuthCookie(token: string): ResponseCookie {
  return {
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: SEVEN_DAYS_MS,
    path: '/',
  };
}
