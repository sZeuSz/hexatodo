export interface HttpRequest {
  body: unknown;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  user?: AuthUser | undefined;
}

export interface AuthUser {
  sub: string;
  email: string;
}

export interface HttpResponse {
  statusCode: number;
  body: unknown;
}

export interface HttpController {
  handle(req: HttpRequest): Promise<HttpResponse>;
}
