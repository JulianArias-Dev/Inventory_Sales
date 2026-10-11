/**
 * Mock database helper for Jest unit tests.
 * Allows simulating MySQL queries and transaction workflows without requiring a real database server.
 */
function createMockPool() {
  const queryHandlers = [];

  const executeMatching = async (sql, params) => {
    // Search handlers in reverse so later registered handlers take precedence
    for (let i = queryHandlers.length - 1; i >= 0; i--) {
      const handler = queryHandlers[i];
      if (handler.matches(sql, params)) {
        return handler.execute(sql, params);
      }
    }
    return [[]];
  };

  const conn = {
    beginTransaction: jest.fn().mockResolvedValue(),
    commit: jest.fn().mockResolvedValue(),
    rollback: jest.fn().mockResolvedValue(),
    release: jest.fn(),
    query: jest.fn().mockImplementation(executeMatching)
  };

  const pool = {
    query: jest.fn().mockImplementation(executeMatching),
    getConnection: jest.fn().mockResolvedValue(conn),
    onQuery: (pattern, result) => {
      queryHandlers.push({
        matches: (sql) => {
          if (typeof pattern === 'string') return sql.includes(pattern);
          if (pattern instanceof RegExp) return pattern.test(sql);
          return false;
        },
        execute: async (sql, params) => {
          if (typeof result === 'function') return result(sql, params);
          if (result instanceof Error) throw result;
          return [result];
        }
      });
      return pool;
    },
    reset: () => {
      queryHandlers.length = 0;
      pool.query.mockClear();
      pool.getConnection.mockClear();
      conn.beginTransaction.mockClear();
      conn.commit.mockClear();
      conn.rollback.mockClear();
      conn.release.mockClear();
      conn.query.mockClear();
    },
    _conn: conn
  };

  return pool;
}

module.exports = { createMockPool };
