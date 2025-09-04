import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
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

/* ---------- LOGGING: force verbose SQL during boot ---------- */
const SQL_DEBUG = Number(process.env.SQL_DEBUG ?? '1'); // REPLACED: default now 1
const logSQL = (message, timing) => {
  const t = timing != null ? ` (${timing} ms)` : '';
  console.log(`SQL${t} > ${message}`);
};
if (SQL_DEBUG >= 1) {
  sequelize.options.logging = logSQL;                     // REPLACED
  sequelize.options.benchmark = true;                     // REPLACED
  sequelize.options.logQueryParameters = true;            // REPLACED
}

/* Optional: show pool/connect lifecycle when SQL_DEBUG=3 */
if (SQL_DEBUG >= 3) {
  sequelize.addHook('beforeConnect', (cfg) => {
    console.log('DB beforeConnect', {
      host: cfg.host, port: cfg.port, db: cfg.database, dialect: cfg.dialect,
    });
  });
  sequelize.addHook('afterConnect', () => console.log('DB afterConnect'));
  sequelize.addHook('beforeDisconnect', () => console.log('DB beforeDisconnect'));
  sequelize.addHook('afterDisconnect', () => console.log('DB afterDisconnect'));

  const pool = sequelize?.connectionManager?.pool;
  if (pool?.on) {
    pool.on('acquire', () => console.log('POOL acquire'));
    pool.on('release', () => console.log('POOL release'));
    pool.on('destroy', () => console.log('POOL destroy'));
  }
}

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

/* ---------- Process-level logging ---------- */
process.on('unhandledRejection', (reason) => console.error('❌ UnhandledRejection:', reason));
process.on('uncaughtException', (err) => console.error('❌ UncaughtException:', err));

/* ---------- Helper: instrument QueryInterface calls ---------- */
function instrumentQI(qi) {
  const methods = [
    'createTable','dropTable','addColumn','changeColumn','removeColumn',
    'addIndex','removeIndex','addConstraint','removeConstraint',
    'renameTable','bulkInsert','bulkDelete','bulkUpdate','sequelizeQuery'
  ];
  for (const m of methods) {
    if (typeof qi[m] === 'function') {
      const orig = qi[m].bind(qi);
      qi[m] = async (...args) => {
        try {
          const preview = args.map(a => {
            try { return JSON.stringify(a).slice(0, 400); } catch { return String(a); }
          }).join(', ');
          console.log(`QI > ${m}(${preview})`);
          return await orig(...args);
        } catch (e) {
          console.error(`QI x ${m}:`, e?.message || e);
          throw e;
        }
      };
    }
  }
  // also proxy raw query logging
  const oq = qi.sequelize.query.bind(qi.sequelize);
  qi.sequelize.query = (sql, opts) => {
    console.log('QI > query()', sql);
    return oq(sql, { logging: logSQL, ...opts });
  };
  return qi;
}

/* ---------- Migrations with Umzug ---------- */
async function runMigrations() {
  applyAssociations();

  // model + column summary before migrations
  const models = sequelize.modelManager.models;
  console.log('=== Models to sync/migrate ===');
  models.forEach((m) => {
    const cols = Object.keys(m.rawAttributes || {}).join(', ');
    console.log(`- ${m.name} -> ${m.tableName} [${cols}]`);
  });

  const glob = path.join(__dirname, 'migrations', '{base__*.js,alter__*.js}');
  const umzug = new Umzug({
    migrations: {
      glob,
      resolve: ({ name, path: p, context }) => ({
        name,
        up: async () => (await import(pathToFileURL(p).href)).up({ context }),
        down: async () => (await import(pathToFileURL(p).href)).down({ context }),
      }),
    },
    // REPLACED: pass instrumented QI so every structural change is logged
    context: instrumentQI(sequelize.getQueryInterface()), // REPLACED
    storage: new SequelizeStorage({ sequelize, tableName: 'SequelizeMeta' }),
    logger: {
      info: (msg) => console.log(`UMZUG > ${msg}`),
      warn: (msg) => console.warn(`UMZUG ! ${msg}`),
      error: (msg) => console.error(`UMZUG x ${msg}`),
      debug: (msg) => { if (SQL_DEBUG >= 2) console.debug(`UMZUG . ${msg}`); },
    },
  });

  umzug.on('migrating', ({ name }) => console.log(`▶ migrating: ${name}`));
  umzug.on('migrated', ({ name }) => console.log(`✔ migrated: ${name}`));
  umzug.on('reverting', ({ name }) => console.log(`↩ reverting: ${name}`));
  umzug.on('reverted', ({ name }) => console.log(`✔ reverted: ${name}`));

  const pending = await umzug.pending();
  console.log(
    pending.length
      ? `➡ pending migrations: ${pending.map((m) => m.name).join(', ')}`
      : '➡ no pending migrations'
  );

  await umzug.up();
  console.log('✅ Migrations up to date.');

  // schema snapshot after migrations
  try {
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('=== Tables after migrate ===');
    console.log(tables);
  } catch {}
}

/* ---------- Startup ---------- */
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connection OK.');

    if (process.env.SYNC_ALTER === '1' && process.env.NODE_ENV !== 'production') {
      console.warn('⚠ SYNC_ALTER enabled. Running sequelize.sync({ alter: true }) for development.');

      applyAssociations();

      // REPLACED: ensure sync emits SQL loudly
      await sequelize.sync({
        alter: true,
        logging: logSQL, // REPLACED
      });

      // snapshot tables after sync
      try {
        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log('=== Tables after sync ===');
        console.log(tables);
      } catch {}
      console.log('✅ sync(alter) completed.');
    } else {
      await runMigrations();
    }

    startExpireReservedJob();

    const server = app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
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
