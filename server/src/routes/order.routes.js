const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const requireAuth = require('../middleware/auth.middleware');

// Checkout route creates a new order
router.post('/checkout', requireAuth, orderController.checkout);

// Get user's order history
router.get('/', requireAuth, orderController.getOrderHistory);

// Rewards
router.get('/rewards/balance', requireAuth, orderController.getRewardBalance);
router.get('/rewards/history', requireAuth, orderController.getRewardHistory);

module.exports = router;
