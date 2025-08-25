// server/middleware/validateZod.js
// Usage: validate.body(schema), validate.query(schema), validate.params(schema)
import { z } from 'zod';

const make =
  (picker) =>
  (schema) =>
  (req, res, next) => {
    const target = picker(req);
    const parsed = schema.safeParse(target);
    if (!parsed.success) {
      const formatted = parsed.error.format();
      const err = new Error(JSON.stringify(formatted));
      err.statusCode = 400;
      return next(err);
    }
    // Attach sanitized payload without mutating original keys.
    if (!req.sanitized) req.sanitized = {};
    req.sanitized = { ...req.sanitized, ...parsed.data };
    return next();
  };

const validate = {
  body: make((req) => req.body ?? {}),
  query: make((req) => req.query ?? {}),
  params: make((req) => req.params ?? {}),
};

export default validate;
