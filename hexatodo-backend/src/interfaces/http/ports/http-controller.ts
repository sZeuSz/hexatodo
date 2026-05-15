export interface HttpRequest {
  body: unknown;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  user?: AuthUser | undefined;
}

export interface AuthUser {
  sub: string;
  email: string;
}

export interface ResponseCookie {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
}

export interface HttpResponse {
  statusCode: number;
  body: unknown;
  cookies?: ResponseCookie[];
  clearCookies?: string[];
}

export interface HttpController {
  handle(req: HttpRequest): Promise<HttpResponse>;
}
