const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  price_inr: { type: Number, required: true },
  name: { type: String, required: true },
  brand: { type: String },
  category: { type: String },
  cloudinary_link: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    coinDiscount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    redeemedCoins: { type: Number, required: true, default: 0 },
    earnedCoins: { type: Number, required: true, default: 0 },
    status: { type: String, required: true, default: 'Delivered', enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
