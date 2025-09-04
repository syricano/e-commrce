// server/scripts/runMigrations.js
// type: module
import { Umzug, SequelizeStorage } from 'umzug';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sequelize from '../db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const makeUmzug = (pattern) =>
  new Umzug({
    migrations: {
      glob: path.join(__dirname, '..', 'migrations', pattern),
      resolve: ({ name, path: p, context }) => ({
        name,
        up: async () => (await import(pathToFileURL(p).href)).up({ context }),
        down: async () => (await import(pathToFileURL(p).href)).down({ context }),
      }),
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize, tableName: 'SequelizeMeta' }),
    logger: console,
  });

async function main() {
  const cmd = (process.argv[2] || 'up').toLowerCase();
  const toArg = process.argv.find((a) => a.startsWith('--to='));
  const to = toArg ? toArg.split('=')[1] : undefined;

  try {
    await sequelize.authenticate();

    if (cmd === 'up') {
      await makeUmzug('base__*.js').up();          // base first
      await makeUmzug('alter__*.js').up({ to });   // then alters
    } else if (cmd === 'down') {
      await makeUmzug('alter__*.js').down({ to }); // reverse order
      await makeUmzug('base__*.js').down({ to });
    } else if (cmd === 'pending') {
      const [p1, p2] = await Promise.all([
        makeUmzug('base__*.js').pending(),
        makeUmzug('alter__*.js').pending(),
      ]);
      console.log([...p1, ...p2].map((m) => m.name));
    } else if (cmd === 'executed') {
      const [e1, e2] = await Promise.all([
        makeUmzug('base__*.js').executed(),
        makeUmzug('alter__*.js').executed(),
      ]);
      console.log([...e1, ...e2].map((m) => m.name));
    } else if (cmd === 'status') {
      const [p1, e1, p2, e2] = await Promise.all([
        makeUmzug('base__*.js').pending(),
        makeUmzug('base__*.js').executed(),
        makeUmzug('alter__*.js').pending(),
        makeUmzug('alter__*.js').executed(),
      ]);
      console.log(
        JSON.stringify(
          { executed: [...e1, ...e2].map((m) => m.name), pending: [...p1, ...p2].map((m) => m.name) },
          null,
          2
        )
      );
    } else {
      console.error('Unknown command. Use: up | down | pending | executed | status');
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Migration error:', err);
    process.exitCode = 1;
  } finally {
    await sequelize.close().catch(() => {});
  }
}
main();
