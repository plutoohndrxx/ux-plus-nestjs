import { Request, Response, NextFunction } from 'express';

export function uniformResponseHeaderMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.setHeader('Content-Type', 'application/json');
  next();
}
