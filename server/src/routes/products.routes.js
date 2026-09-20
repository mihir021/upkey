const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getCategories,
  getRecommendations,
} = require('../controllers/products.controller');

router.get('/categories', getCategories);
router.get('/:id/recommendations', getRecommendations);
router.get('/:id', getProductById);
router.get('/', getAllProducts);

module.exports = router;
