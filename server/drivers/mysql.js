import SyncMySQL from 'sync-mysql';

export function createMysqlDatabase(config) {
  const databaseName = resolveDatabaseName(config);
  ensureDatabaseExists(databaseName, config);
  const connection = new SyncMySQL(buildConnectionOptions(config, databaseName));
  migrate(connection);
  return new MysqlDatabase(connection);
}

function resolveDatabaseName(config) {
  const connectionString = config.connectionString || process.env.PAYBRIDGE_DB_URL;
  if (connectionString) {
    const url = new URL(connectionString);
    return decodeURIComponent(url.pathname.replace(/^\//, '')) || 'paybridge';
  }
  return config.database || process.env.PAYBRIDGE_DB_NAME || 'paybridge';
}

function ensureDatabaseExists(databaseName, config) {
  const bootstrap = new SyncMySQL(buildConnectionOptions(config, 'mysql'));
  bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
}

function buildConnectionOptions(config, databaseName = resolveDatabaseName(config)) {
  const connectionString = config.connectionString || process.env.PAYBRIDGE_DB_URL;

  if (connectionString) {
    const url = new URL(connectionString);
    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username || ''),
      password: decodeURIComponent(url.password || ''),
      database: databaseName,
      charset: 'utf8mb4',
    };
  }

  return {
    host: config.host || process.env.PAYBRIDGE_DB_HOST || '127.0.0.1',
    port: Number(config.port || process.env.PAYBRIDGE_DB_PORT || 3306),
    user: config.user || process.env.PAYBRIDGE_DB_USER || 'root',
    password: config.password || process.env.PAYBRIDGE_DB_PASSWORD || '',
    database: databaseName,
    charset: 'utf8mb4',
  };
}

function migrate(connection) {
  const statements = `
    CREATE TABLE IF NOT EXISTS merchants (
      id VARCHAR(64) PRIMARY KEY,
      business_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      status VARCHAR(64) NOT NULL DEFAULT 'sandbox_active',
      created_at VARCHAR(64) NOT NULL
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS api_keys (
      id VARCHAR(64) PRIMARY KEY,
      merchant_id VARCHAR(64) NOT NULL,
      key_prefix VARCHAR(64) NOT NULL,
      key_hash VARCHAR(128) NOT NULL UNIQUE,
      created_at VARCHAR(64) NOT NULL,
      last_used_at VARCHAR(64) NULL,
      CONSTRAINT fk_api_keys_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(64) PRIMARY KEY,
      merchant_id VARCHAR(64) NOT NULL,
      amount BIGINT NOT NULL,
      currency VARCHAR(8) NOT NULL,
      receipt VARCHAR(255) NULL,
      status VARCHAR(64) NOT NULL,
      notes_json TEXT NOT NULL,
      created_at VARCHAR(64) NOT NULL,
      updated_at VARCHAR(64) NOT NULL,
      CONSTRAINT fk_orders_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS payments (
      id VARCHAR(64) PRIMARY KEY,
      merchant_id VARCHAR(64) NOT NULL,
      order_id VARCHAR(64) NOT NULL,
      amount BIGINT NOT NULL,
      currency VARCHAR(8) NOT NULL,
      method VARCHAR(32) NOT NULL,
      status VARCHAR(64) NOT NULL,
      processor_reference VARCHAR(255) NULL,
      failure_code VARCHAR(128) NULL,
      failure_reason VARCHAR(255) NULL,
      method_details_json TEXT NOT NULL,
      created_at VARCHAR(64) NOT NULL,
      updated_at VARCHAR(64) NOT NULL,
      CONSTRAINT fk_payments_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id),
      CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS refunds (
      id VARCHAR(64) PRIMARY KEY,
      merchant_id VARCHAR(64) NOT NULL,
      payment_id VARCHAR(64) NOT NULL,
      amount BIGINT NOT NULL,
      status VARCHAR(64) NOT NULL,
      reason VARCHAR(255) NULL,
      created_at VARCHAR(64) NOT NULL,
      updated_at VARCHAR(64) NOT NULL,
      CONSTRAINT fk_refunds_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id),
      CONSTRAINT fk_refunds_payment FOREIGN KEY (payment_id) REFERENCES payments(id)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS webhook_events (
      id VARCHAR(64) PRIMARY KEY,
      merchant_id VARCHAR(64) NOT NULL,
      event_type VARCHAR(64) NOT NULL,
      resource_type VARCHAR(64) NOT NULL,
      resource_id VARCHAR(64) NOT NULL,
      payload_json TEXT NOT NULL,
      delivery_status VARCHAR(32) NOT NULL DEFAULT 'pending',
      attempts INT NOT NULL DEFAULT 0,
      created_at VARCHAR(64) NOT NULL,
      delivered_at VARCHAR(64) NULL,
      CONSTRAINT fk_webhook_events_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS idempotency_keys (
      merchant_id VARCHAR(64) NOT NULL,
      \`key\` VARCHAR(255) NOT NULL,
      method VARCHAR(16) NOT NULL,
      path VARCHAR(255) NOT NULL,
      request_hash VARCHAR(128) NOT NULL,
      status_code INT NOT NULL,
      response_json TEXT NOT NULL,
      created_at VARCHAR(64) NOT NULL,
      PRIMARY KEY (merchant_id, \`key\`),
      CONSTRAINT fk_idempotency_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id)
    ) ENGINE=InnoDB;
  `.split(';').map((statement) => statement.trim()).filter(Boolean);

  for (const statement of statements) {
    connection.query(statement);
  }
}

class MysqlDatabase {
  constructor(connection) {
    this.connection = connection;
  }

  prepare(sql) {
    return new MysqlStatement(this.connection, sql);
  }

  exec(sql) {
    const statement = sql.trim().toUpperCase();
    if (statement.startsWith('BEGIN')) {
      this.connection.query('START TRANSACTION');
      return this;
    }
    if (statement.startsWith('COMMIT')) {
      this.connection.query('COMMIT');
      return this;
    }
    if (statement.startsWith('ROLLBACK')) {
      this.connection.query('ROLLBACK');
      return this;
    }

    this.connection.query(sql);
    return this;
  }
}

class MysqlStatement {
  constructor(connection, sql) {
    this.connection = connection;
    this.sql = sql;
  }

  run(...params) {
    const result = this.connection.query(this.sql, params);
    return {
      changes: result?.affectedRows ?? 0,
      lastInsertRowid: result?.insertId ?? 0,
    };
  }

  get(...params) {
    const rows = this.connection.query(this.sql, params);
    return rows?.[0] ?? null;
  }

  all(...params) {
    return this.connection.query(this.sql, params) ?? [];
  }
}
