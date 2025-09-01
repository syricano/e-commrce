// server/index.js
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import { Umzug, SequelizeStorage } from 'umzug';
import passport from './config/passport.js';
import sequelize from './db/index.js';
import applyAssociations from './db/association.js';
import startExpireReservedJob from './jobs/expireReserved.js';
import mountAll from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import ErrorResponse from './utils/errorResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 8080;

/* ---------- Core middleware ---------- */
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

/* ---------- Sessions & auth ---------- */
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

/* ---------- Static & health ---------- */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/favicon.ico', (_req, res) => res.sendStatus(204));

/* ---------- API routes ---------- */
mountAll(app);

/* ---------- SPA in production ---------- */
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(buildPath));
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(buildPath, 'index.html')));
}

/* ---------- Root hint in dev ---------- */
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (_req, res) => res.type('text').send(`API running on :${PORT}. Try /health or /api/*`));
}

/* ---------- 404 ---------- */
app.use((_req, _res, next) => next(new ErrorResponse('Not Found', 404)));

/* ---------- Error handler ---------- */
app.use(errorHandler);

/* ---------- Migrations with Umzug ---------- */
async function runMigrations() {
  // Ensure models & associations are registered before migrations that may rely on naming
  applyAssociations();

  const umzug = new Umzug({
    migrations: { glob: path.join(__dirname, 'migrations', '*.js') },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({
      sequelize,
      tableName: 'sequelize_meta', // default; customize if needed
    }),
    logger: console,
  });

  const pending = await umzug.pending();
  if (pending.length > 0) {
    console.log(`Running ${pending.length} migration(s)…`);
  }
  await umzug.up();
  console.log('Migrations up to date.');
}

/* ---------- Startup ---------- */
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connection OK.');

    // Prefer migrations. To force sync in dev, set SYNC_ALTER=1.
    if (process.env.SYNC_ALTER === '1' && process.env.NODE_ENV !== 'production') {
      console.warn('SYNC_ALTER enabled. Running sequelize.sync({ alter: true }) for development.');
      applyAssociations();
      await sequelize.sync({ alter: true });
    } else {
      await runMigrations();
    }

    startExpireReservedJob();

    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    // Graceful shutdown
    const shutdown = (sig) => {
      console.log(`${sig} received. Shutting down…`);
      server.close(() => process.exit(0));
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

start();
