const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const RewardTransaction = require('../models/RewardTransaction');

// Configurables
const COINS_EARNED_PER_100_INR = 10;
const COINS_REQUIRED_PER_1_INR_DISCOUNT = 10;
const PROMO_CODES = { 'JOYORY10': 10, 'GLOW20': 20, 'FIRST15': 15 };
const FREE_SHIPPING_THRESHOLD = 999;
const DELIVERY_FEE = 49;

exports.checkout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.userId;
    const { items, redeemCoins = 0, promoCode } = req.body;

    if (!items || !items.length) {
      throw new Error('Cart is empty.');
    }

    if (redeemCoins < 0) {
      throw new Error('Cannot redeem a negative amount of coins.');
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error('User not found.');
    }

    if (redeemCoins > user.coinsBalance) {
      throw new Error('Insufficient Joyory Coins.');
    }

    // 1. Calculate subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findOne({ id: item.productId }).session(session);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      
      const price = product.price_inr || 0;
      subtotal += price * item.qty;
      
      orderItems.push({
        productId: product.id,
        qty: item.qty,
        price_inr: price,
        name: product.name,
        brand: product.brand,
        cloudinary_link: product.cloudinary_link
      });
    }

    // 2. Apply promo discount
    let discount = 0;
    if (promoCode) {
      const pct = PROMO_CODES[promoCode.trim().toUpperCase()];
      if (pct) {
        discount = Math.floor((subtotal * pct) / 100);
      }
    }

    // 3. Apply coin discount
    // 10 coins = 1 INR
    const coinDiscount = Math.floor(redeemCoins / COINS_REQUIRED_PER_1_INR_DISCOUNT);
    
    if (coinDiscount > (subtotal - discount)) {
      throw new Error('Coin discount cannot exceed the payable subtotal.');
    }

    // 4. Calculate Delivery
    const preDeliveryTotal = subtotal - discount - coinDiscount;
    const deliveryFee = (subtotal - discount) > FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE;

    // 5. Final Total
    const total = preDeliveryTotal + deliveryFee;

    // 6. Calculate Earned Coins
    const earnedCoins = Math.floor(total / 100) * COINS_EARNED_PER_100_INR;

    // 7. Update User Balance & Ledger
    user.coinsBalance -= redeemCoins;
    user.coinsBalance += earnedCoins;
    await user.save({ session });

    const orderId = `ORD-${Date.now()}`;

    if (redeemCoins > 0) {
      await RewardTransaction.create([{
        userId,
        type: 'REDEEM',
        amount: -redeemCoins,
        orderId,
        description: `Redeemed on Order #${orderId}`
      }], { session });
    }

    if (earnedCoins > 0) {
      await RewardTransaction.create([{
        userId,
        type: 'EARN',
        amount: earnedCoins,
        orderId,
        description: `Earned from Order #${orderId}`
      }], { session });
    }

    // 8. Create Order
    const order = new Order({
      userId,
      orderId,
      items: orderItems,
      subtotal,
      deliveryFee,
      discount,
      coinDiscount,
      total,
      redeemedCoins,
      earnedCoins,
      status: 'Delivered'
    });

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: 'Order placed successfully.',
      order,
      coinDetails: {
        redeemed: redeemCoins,
        earned: earnedCoins,
        balance: user.coinsBalance
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ message: error.message });
  }
};

exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    // Map to frontend expected format
    const formattedOrders = orders.map(o => ({
      id: o.orderId,
      date: o.createdAt,
      total: o.total,
      status: o.status,
      items: o.items.map(i => ({
        qty: i.qty,
        product: {
          id: i.productId,
          name: i.name,
          brand: i.brand,
          price_inr: i.price_inr,
          cloudinary_link: i.cloudinary_link
        }
      }))
    }));
    return res.status(200).json(formattedOrders);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching orders.' });
  }
};

exports.getRewardBalance = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.status(200).json({ coinsBalance: user.coinsBalance });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching balance.' });
  }
};

exports.getRewardHistory = async (req, res) => {
  try {
    const history = await RewardTransaction.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.status(200).json(history);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching history.' });
  }
};
