const categoryService = require('../services/categoryService');

exports.getAll = async (req, res, next) => {
  try {
    const categories = await categoryService.getAll();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = req.params.categoryId || req.params.id;
    const category = await categoryService.getById(id);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    // Bug 2 fix: Response includes the generated id along with the name
    const newCategory = await categoryService.create(req.body);
    res.status(201).json(newCategory);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    // Bug 1 fix: Route parameter properly matches id/categoryId
    const id = req.params.categoryId || req.params.id;
    const updated = await categoryService.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
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
    const id = req.params.categoryId || req.params.id;
    const result = await categoryService.delete(id);
    if (!result.found) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    // Bug 3 fix: Return HTTP 400 when category cannot be deleted due to associated products
    if (result.hasRelations) {
      return res.status(400).send(result.message);
    }
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.tieneProductos = async (req, res, next) => {
  try {
    const id = req.params.categoryId || req.params.id;
    const has = await categoryService.hasProducts(id);
    res.json(has);
  } catch (error) {
    next(error);
  }
};
