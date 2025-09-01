// server/utils/errorHandler.js
function errorHandler(err, req, res, _next) {
  const status = err?.statusCode || 500;
  const out = { message: err?.message || 'Server error' };

  // Only emit Zod data if it exists. Never read ad-hoc props like "_zod".
  if (err?.isZod && err?.details) out.validation = err.details;

  if (process.env.NODE_ENV !== 'production') {
    out.stack = err?.stack;
    out.kind = err?.name;
    if (err?.context) out.context = err.context;
  }

  res.status(status).json(out);
}

export { errorHandler };
export default errorHandler;
