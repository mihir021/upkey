const User = require('../models/User');

// Valid values for validation
const VALID_SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];
const VALID_SKIN_TONES = ['Fair', 'Light', 'Medium', 'Tan', 'Deep', 'All'];

/**
 * PUT /api/profile/preferences
 * Saves or updates the authenticated user's skincare preferences.
 * Sets onboardingCompleted = true on successful save.
 */
async function updatePreferences(req, res) {
  try {
    const {
      skinType,
      skinTone,
      concerns,
      budget,
      preferredCategories,
      preferredIngredients,
      shoppingGoals,
    } = req.body;

    // ── Validation ──
    if (skinType && !VALID_SKIN_TYPES.includes(skinType)) {
      return res.status(400).json({ message: `Invalid skinType. Must be one of: ${VALID_SKIN_TYPES.join(', ')}` });
    }
    if (skinTone && !VALID_SKIN_TONES.includes(skinTone)) {
      return res.status(400).json({ message: `Invalid skinTone. Must be one of: ${VALID_SKIN_TONES.join(', ')}` });
    }
    if (budget !== undefined && (typeof budget !== 'number' || budget < 0)) {
      return res.status(400).json({ message: 'Budget must be a non-negative number.' });
    }

    // Normalize arrays — ensure they are arrays of non-empty strings
    const normalizeArray = (val) => {
      if (!val) return [];
      if (!Array.isArray(val)) return [];
      return val.filter(v => typeof v === 'string' && v.trim().length > 0).map(v => v.trim());
    };

    const update = {
      onboardingCompleted: true,
    };
    if (skinType) update.skinType = skinType;
    if (skinTone) update.skinTone = skinTone;
    if (concerns) update.concerns = normalizeArray(concerns);
    if (budget !== undefined) update.budget = budget;
    if (preferredCategories) update.preferredCategories = normalizeArray(preferredCategories);
    if (preferredIngredients) update.preferredIngredients = normalizeArray(preferredIngredients);
    if (shoppingGoals) update.shoppingGoals = normalizeArray(shoppingGoals);

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: update },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'Preferences saved successfully.',
      user,
    });
  } catch (err) {
    console.error('updatePreferences error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Error saving preferences.' });
  }
}

/**
 * GET /api/profile/preferences
 * Returns the authenticated user's current preferences.
 */
async function getPreferences(req, res) {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      skinType: user.skinType || null,
      skinTone: user.skinTone || null,
      concerns: user.concerns || [],
      budget: user.budget || null,
      preferredCategories: user.preferredCategories || [],
      preferredIngredients: user.preferredIngredients || [],
      shoppingGoals: user.shoppingGoals || [],
      onboardingCompleted: Boolean(user.onboardingCompleted),
    });
  } catch (err) {
    console.error('getPreferences error:', err);
    res.status(500).json({ message: 'Error fetching preferences.' });
  }
}

module.exports = { updatePreferences, getPreferences };
