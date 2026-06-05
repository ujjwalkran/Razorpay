import { getDatabaseConfig } from './config.js';
import { createSqliteDatabase } from './drivers/sqlite.js';
import { createPostgresDatabase } from './drivers/postgres.js';
import { createMysqlDatabase } from './drivers/mysql.js';
import { createOracleDatabase } from './drivers/oracle.js';

function resolveAdapterForEngine(engine) {
  if (engine === 'postgres' || engine === 'postgresql') return './drivers/postgres.js';
  if (engine === 'mysql') return './drivers/mysql.js';
  if (engine === 'oracle') return './drivers/oracle.js';
  return './drivers/sqlite.js';
}

export function createDatabase(dbPath = getDatabaseConfig().path, engineOverride = null) {
  const baseConfig = getDatabaseConfig();
  const resolvedEngine = (engineOverride || process.env.PAYBRIDGE_DB_ENGINE || baseConfig.engine || 'sqlite').toLowerCase();
  const resolvedAdapter = process.env.PAYBRIDGE_DB_ADAPTER
    || (engineOverride ? resolveAdapterForEngine(resolvedEngine) : baseConfig.adapterModule)
    || resolveAdapterForEngine(resolvedEngine);
  const config = getDatabaseConfig({
    ...process.env,
    PAYBRIDGE_DB_PATH: dbPath,
    PAYBRIDGE_DB_ENGINE: resolvedEngine,
    PAYBRIDGE_DB_ADAPTER: resolvedAdapter,
  });

  switch ((config.engine || 'sqlite').toLowerCase()) {
    case 'sqlite':
      return createSqliteDatabase(config);
    case 'postgres':
    case 'postgresql':
      return createPostgresDatabase(config);
    case 'mysql':
      return createMysqlDatabase(config);
    case 'oracle':
      return createOracleDatabase(config);
    default:
      throw new Error(`Unsupported DB engine '${config.engine}'. Use sqlite, postgres, mysql, or oracle.`);
  }
}

export function rowToJson(row, jsonFields = []) {
  if (!row) return null;
  const entity = { ...row };
  for (const field of jsonFields) {
    if (field in entity) {
      const target = field.replace(/_json$/, '');
      entity[target] = JSON.parse(entity[field] || '{}');
      delete entity[field];
    }
  }
  return entity;
}
