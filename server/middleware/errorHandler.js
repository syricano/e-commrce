// server/middleware/errorHandler.js
import { ValidationError, UniqueConstraintError } from 'sequelize';


export default function errorHandler(err, req, res, _next) {
  // Best-effort console log for server operators
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error('❌ Request error:', {
      method: req?.method,
      url: req?.originalUrl || req?.url,
      message: err?.message,
      name: err?.name,
      stack: err?.stack,
    });
  }

  // Choose status code: default 500, handle common ORM cases
  let code = 500;
  if (Number.isInteger(err?.statusCode) && err.statusCode >= 100 && err.statusCode <= 599) {
    code = err.statusCode;
  } else if (err instanceof UniqueConstraintError) {
    code = 409; // conflict
  } else if (err instanceof ValidationError) {
    code = 400;
  }

  const body = {
    message: typeof err?.message === 'string' && err.message ? err.message : 'Server error',
  };

  // Zod validation payload (if present)
  if (err?.isZod && err?.details) {
    body.validation = err.details;
  }

  // Sequelize validation payload
  if (err instanceof ValidationError) {
    body.message = 'Validation error';
    body.errors =
      Array.isArray(err.errors) &&
      err.errors.map((e) => ({
        message: e?.message,
        path: e?.path,
        type: e?.type,
        validatorKey: e?.validatorKey,
      }));
  }

  // Extra diagnostics in non-production
  if (process.env.NODE_ENV !== 'production') {
    if (typeof err?.name === 'string') body.kind = err.name;
    if (typeof err?.stack === 'string') body.stack = err.stack;
    if (err?.context) body.context = err.context;
  }

  try {
    if (!res.headersSent) {
      res.status(code).json(body);
    } else {
      res.end();
    }
  } catch {
    // If even writing the error fails, try a last-resort minimal 500
    try {
      if (!res.headersSent) {
        res.status(500).json({ message: 'Server error' });
      } else {
        res.end();
      }
    } catch {
      // give up silently
    }
  }
}
