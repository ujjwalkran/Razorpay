import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readConfigFile(filePath) {
  if (!existsSync(filePath)) return {};
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

export function getDatabaseConfig(env = process.env) {
  const fileConfig = readConfigFile(resolve(__dirname, 'db.config.json'));
  const exampleConfig = readConfigFile(resolve(__dirname, 'db.config.example.json'));
  const baseConfig = {
    ...(exampleConfig.database || {}),
    ...(fileConfig.database || {}),
  };

  return {
    engine: env.PAYBRIDGE_DB_ENGINE || baseConfig.engine || 'sqlite',
    adapterModule: env.PAYBRIDGE_DB_ADAPTER || baseConfig.adapterModule || './drivers/sqlite.js',
    path: env.PAYBRIDGE_DB_PATH || baseConfig.path || resolve(process.cwd(), 'data/paybridge-sandbox.sqlite'),
    host: env.PAYBRIDGE_DB_HOST || baseConfig.host || 'localhost',
    port: env.PAYBRIDGE_DB_PORT || baseConfig.port || 5432,
    user: env.PAYBRIDGE_DB_USER || baseConfig.user || '',
    password: env.PAYBRIDGE_DB_PASSWORD || baseConfig.password || '',
    database: env.PAYBRIDGE_DB_NAME || baseConfig.database || '',
    connectionString: env.PAYBRIDGE_DB_URL || baseConfig.connectionString || '',
  };
}
