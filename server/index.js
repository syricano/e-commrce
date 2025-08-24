// server/index.js
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from './config/passport.js';
import sequelize from './db/index.js';
import applyAssociations from './db/association.js';
import { routeMap } from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import ErrorResponse from './utils/errorResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// core middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// sessions (only once)
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// passport
app.use(passport.initialize());
app.use(passport.session()); // if you use session:true in OAuth

// static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// health + quiet favicon
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/favicon.ico', (_req, res) => res.sendStatus(204));

// API routes first
routeMap.forEach(({ path, handler }) => app.use(path, handler));

// serve SPA only for non-/api paths in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(buildPath));
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(buildPath, 'index.html')));
}

// root hint in dev
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (_req, res) => res.type('text').send('API running on :8000. Try /health or /api/*'));
}

// 404 for unmatched requests
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
