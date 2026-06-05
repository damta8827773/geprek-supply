import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError.js';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Returns middleware that validates a part of the request against a Zod schema
 * and replaces it with the parsed (typed, coerced) value.
 */
export function validate(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[part]);
      // query/params are read-only getters in some setups; assign defensively.
      Object.defineProperty(req, part, { value: parsed, writable: true, configurable: true });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(ApiError.badRequest('Validation failed', err.flatten().fieldErrors));
        return;
      }
      next(err);
    }
  };
}
