import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async route handler to automatically catch errors and forward to Express error middleware.
 * Eliminates the need for try/catch in every controller.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
