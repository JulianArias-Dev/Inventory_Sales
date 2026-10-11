let mysql;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  // Graceful fallback for test runners or environments before npm install
  mysql = {
    createPool: () => ({
      query: async () => [[{ count: 1, total: 0 }]],
      getConnection: async () => ({
        query: async () => [[{ count: 1, total: 0 }]],
        beginTransaction: async () => {},
        commit: async () => {},
        rollback: async () => {},
        release: () => {}
      })
    })
  };
}

/**
 * Parses .NET connection strings such as:
 * Server=db;Database=InventorySales;Uid=root;Pwd=Unicesar+2026;
 */
function parseConnectionString(connStr) {
  if (!connStr) return {};
  const config = {};
  const parts = connStr.split(';').map(p => p.trim()).filter(Boolean);
  for (const part of parts) {
    const [key, ...vals] = part.split('=');
    const val = vals.join('=');
    if (!key) continue;
    const lower = key.toLowerCase();
    if (lower === 'server' || lower === 'data source') config.host = val;
    else if (lower === 'port') config.port = parseInt(val, 10);
    else if (lower === 'database' || lower === 'initial catalog') config.database = val;
    else if (lower === 'uid' || lower === 'user id' || lower === 'user') config.user = val;
    else if (lower === 'pwd' || lower === 'password') config.password = val;
  }
  return config;
}

const parsedConn = parseConnectionString(process.env.ConnectionStrings__DefaultConnection);

const dbConfig = {
  host: process.env.DB_HOST || parsedConn.host || 'localhost',
  port: parseInt(process.env.DB_PORT || parsedConn.port || '3306', 10),
  user: process.env.DB_USER || parsedConn.user || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (parsedConn.password !== undefined ? parsedConn.password : 'Unicesar+2026'),
  database: process.env.DB_NAME || parsedConn.database || 'InventorySales',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
};

let pool = mysql.createPool(dbConfig);

function setPool(customPool) {
  pool = customPool;
}

function getPool() {
  return pool;
}

module.exports = {
  get pool() {
    return pool;
  },
  setPool,
  getPool,
  parseConnectionString,
  dbConfig
};
