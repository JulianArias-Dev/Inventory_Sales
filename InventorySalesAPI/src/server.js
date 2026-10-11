require('dotenv').config();
const app = require('./app');
const { initializeDatabase } = require('./database/initDb');

const PORT = parseInt(process.env.PORT || '8080', 10);

async function startServer() {
  try {
    // Attempt database schema creation and initial seeding
    await initializeDatabase();
  } catch (err) {
    console.error('Error during database initialization:', err);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`InventorySalesAPI (Express) escuchando en puerto ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Swagger docs: http://localhost:${PORT}/swagger/index.html`);
    console.log(`===============================================`);
  });

  const shutdown = () => {
    console.log('Cerrando servidor...');
    server.close(() => {
      console.log('Servidor cerrado.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
