module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js', '**/?(*.)+(spec|test).js'],
  verbose: true,
  clearMocks: true,
  testTimeout: 10000,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/database/initDb.js'
  ]
};
