const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health and root endpoints
app.get('/', (req, res) => {
  res.status(200).send('API running');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Swagger documentation endpoint compatibility
app.get('/swagger/index.html', (req, res) => {
  res.status(200).send('<html><head><title>API Docs</title></head><body><h1>Inventory Sales API</h1><p>Running on Express</p></body></html>');
});
app.get('/swagger', (req, res) => {
  res.redirect('/swagger/index.html');
});

// Mount API routes
app.use('/api', routes);

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: `Ruta ${req.originalUrl} no encontrada` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ message });
});

module.exports = app;
