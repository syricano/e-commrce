// client/src/services/index.js
import * as api from './api';

export * from './api';
export { default as createCrud } from './crudFactory';

export default api;
