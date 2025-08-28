const errorHandler = (err, req, res, next) => {
  process.env.NODE_ENV !== 'production' && console.error(err.stack || err);

  // Zod validation errors (tagged in validateZod)
  if (err.isZod && err.details && typeof err.details === 'object') {
    const fields = Object.keys(err.details);
    const first = fields.find((k) => err.details[k]?._errors?.length);
    const message = (first && err.details[first]._errors[0]) || 'Invalid input';
    return res.status(err.statusCode || 400).json({ error: message, details: err.details });
  }

  // Standard handler
  res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
};

export default errorHandler;
