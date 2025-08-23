// server/index.js
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import sequelize from './db/index.js';
import applyAssociations from './db/association.js';
import { routeMap } from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import ErrorResponse from './utils/errorResponse.js';

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// optional: static files (if you want to serve uploads or frontend build)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// mount routes
routeMap.forEach(({ path, handler }) => app.use(path, handler));

// health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404
app.use((req, res, next) => next(new ErrorResponse('Not Found', 404)));

// error handler
app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    applyAssociations();
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

start();
