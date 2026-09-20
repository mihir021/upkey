const mongoose = require('mongoose');

const rewardTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, enum: ['EARN', 'REDEEM', 'REFUND', 'ADJUSTMENT'] },
    amount: { type: Number, required: true }, // positive for EARN/REFUND, negative for REDEEM
    orderId: { type: String }, // To link to a specific order
    description: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('RewardTransaction', rewardTransactionSchema);
