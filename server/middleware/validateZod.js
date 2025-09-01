// server/middleware/validateZod.js
function isSchema(s) { return !!(s && typeof s.safeParse === 'function'); }

function make(key, pick) {
  return (schema) => (req, _res, next) => {
    if (!isSchema(schema)) {
      const err = new Error('Invalid Zod schema');
      err.statusCode = 500;
      err.context = { key, typeofSchema: typeof schema };
      return next(err);
    }
    const parsed = schema.safeParse(pick(req) ?? {});
    if (!parsed.success) {
      const err = new Error('Validation failed');
      err.statusCode = 400;
      err.isZod = true;
      err.details = parsed.error.format();
      return next(err);
    }
    req.sanitized = { ...(req.sanitized || {}), [key]: parsed.data, ...parsed.data };
    return next();
  };
}

const validate = {
  body: make('body', (req) => req.body),
  query: make('query', (req) => req.query),
  params: make('params', (req) => req.params),
};

export { validate };
export default validate;
