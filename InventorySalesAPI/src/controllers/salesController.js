const salesService = require('../services/salesService');

exports.getAll = async (req, res, next) => {
  try {
    const sales = await salesService.getAll();
    res.json(sales);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = req.params.saleId || req.params.id;
    const sale = await salesService.getById(id);
    if (!sale) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    res.json(sale);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const newSale = await salesService.create(req.body);
    res.status(201).json(newSale);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};
