const productService = require('../services/productService');

exports.getAll = async (req, res, next) => {
  try {
    const products = await productService.getAll();
    res.json(products);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = req.params.productId || req.params.id;
    const product = await productService.getById(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const newProduct = await productService.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.productId || req.params.id;
    const updated = await productService.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(updated);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const id = req.params.productId || req.params.id;
    const result = await productService.delete(id);
    if (!result.found) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    // Bug 3 fix: Return HTTP 400 when product cannot be deleted due to associated sales
    if (result.hasRelations) {
      return res.status(400).send(result.message);
    }
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
