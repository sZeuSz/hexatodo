import type { NextFunction, Request, Response } from 'express';
import type { HttpController } from '../ports/http-controller.js';

export function adaptRoute(controller: HttpController) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await controller.handle({
        body: req.body,
        params: req.params as Record<string, string>,
        query: req.query as Record<string, string>,
        headers: req.headers as Record<string, string>,
        user: req.user,
      });

      res.status(result.statusCode).json(result.body);
    } catch (err) {
      next(err);
    }
  };
}
