export const asyncHandler = (fn, label = 'Request failed') => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      // propagate; caller decides how to toast/log
      err.__label = label;
      throw err;
    }
  };
};

export default asyncHandler;
