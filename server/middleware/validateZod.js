// server/middleware/validateZod.js
// Usage: validate.body(schema), validate.query(schema), validate.params(schema)
import { z } from 'zod';

const make = (key, picker) => (schema) => (req, res, next) => {
  const target = picker(req);
  const parsed = schema.safeParse(target);
  if (!parsed.success) {
    const formatted = parsed.error.format();
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.isZod = true;
    err.details = formatted;
    return next(err);
  }
  // Attach sanitized payload under namespaced key and flattened (for legacy usage)
  if (!req.sanitized) req.sanitized = {};
  req.sanitized[key] = parsed.data;
  req.sanitized = { ...req.sanitized, ...parsed.data };
  return next();
};

const validate = {
  body: make('body', (req) => req.body ?? {}),
  query: make('query', (req) => req.query ?? {}),
  params: make('params', (req) => req.params ?? {}),
};

export default validate;
