const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getCategories,
  getRecommendations,
  getCatalogValues,
} = require('../controllers/products.controller');

router.get('/categories', getCategories);
router.get('/catalog-values', getCatalogValues);
router.get('/:id/recommendations', getRecommendations);
router.get('/:id', getProductById);
router.get('/', getAllProducts);

module.exports = router;
