const mongoose = require('mongoose');

// We never store the raw password - only a bcrypt hash of it (added in Step 0.5).
// `unique: true` on email creates a MongoDB index that rejects duplicate signups
// at the database level (in addition to any check we do in the controller).
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    coinsBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Personalization / Onboarding ──
    skinType: {
      type: String,
      enum: ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'],
    },
    skinTone: {
      type: String,
      enum: ['Fair', 'Light', 'Medium', 'Tan', 'Deep', 'All'],
    },
    concerns:             [{ type: String, trim: true }],
    budget:               { type: Number, min: 0 },
    preferredCategories:  [{ type: String, trim: true }],
    preferredIngredients: [{ type: String, trim: true }],
    shoppingGoals:        [{ type: String, trim: true }],
    onboardingCompleted:  { type: Boolean, default: false },
  },
  {
    timestamps: true, // adds createdAt / updatedAt automatically
  }
);

module.exports = mongoose.model('User', userSchema);
