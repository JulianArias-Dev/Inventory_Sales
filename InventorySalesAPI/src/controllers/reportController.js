const reportService = require('../services/reportService');

exports.getSummary = async (req, res, next) => {
  try {
    const summary = await reportService.getSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

exports.getSalesByDay = async (req, res, next) => {
  try {
    const salesByDay = await reportService.getSalesByDay();
    res.json(salesByDay);
  } catch (error) {
    next(error);
  }
};

exports.getTopProducts = async (req, res, next) => {
  try {
    const top = req.params.top || 5;
    const topProducts = await reportService.getTopProducts(top);
    res.json(topProducts);
  } catch (error) {
    next(error);
  }
};

exports.getSalesByCategory = async (req, res, next) => {
  try {
    const salesByCategory = await reportService.getSalesByCategory();
    res.json(salesByCategory);
  } catch (error) {
    next(error);
  }
};
