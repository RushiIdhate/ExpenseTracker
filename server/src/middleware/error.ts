import type { NextFunction, Request, Response } from 'express';

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  console.error(error);
  const message = error instanceof Error ? error.message : 'Internal server error.';
  res.status(500).json({ message });
}
