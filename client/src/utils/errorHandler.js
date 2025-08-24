import { toast } from 'react-hot-toast';

const pickMessage = (err, fallback) => {
  const r = err?.response;
  return (
    r?.data?.message ||
    r?.data?.error ||
    err?.message ||
    fallback ||
    'Error'
  );
};

export const errorHandler = (err, fallback) => {
  const msg = pickMessage(err, fallback);
  // single toast per error origin
  toast.error(msg);
  return msg;
};

export default errorHandler;
