const User = require('../models/User');
const Product = require('../models/Product');
const { productMatchedTotal } = require('../metrics/prometheus');

// req.userId was set by the requireAuth middleware after verifying the JWT.
async function getDashboard(req, res) {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const sections = [];
    const hasPrefs = user.onboardingCompleted && user.skinType;

    if (hasPrefs) {
      // 1. Recommended For You — matches skin type + concerns, within budget
      const recFilter = { skin_types: { $in: [new RegExp(user.skinType, 'i')] } };
      if (user.concerns && user.concerns.length > 0) {
        recFilter.concerns = { $in: user.concerns.map(c => new RegExp(c, 'i')) };
      }
      if (user.budget && user.budget > 0) {
        recFilter.price_inr = { $lte: user.budget };
      }
      const recommended = await Product.find(recFilter).sort({ rating: -1 }).limit(8).lean();
      if (recommended.length > 0) {
        sections.push({
          id: 'recommended',
          title: 'Recommended For You',
          subtitle: `Based on your ${user.skinType} skin${user.concerns?.length ? ' + ' + user.concerns.slice(0, 2).join(', ') : ''}`,
          products: recommended,
        });
      }

      // 2. Category picks — one section per preferred category
      if (user.preferredCategories && user.preferredCategories.length > 0) {
        for (const cat of user.preferredCategories.slice(0, 3)) {
          const catFilter = { category: { $regex: new RegExp(`^${cat}$`, 'i') } };
          if (user.budget && user.budget > 0) {
            catFilter.price_inr = { $lte: user.budget };
          }
          const catProducts = await Product.find(catFilter).sort({ rating: -1 }).limit(6).lean();
          if (catProducts.length > 0) {
            sections.push({
              id: `category-${cat.toLowerCase()}`,
              title: `Your ${cat} Picks`,
              subtitle: `Top rated ${cat.toLowerCase()} products for you`,
              products: catProducts,
            });
          }
        }
      }

      // 3. Within Your Budget
      if (user.budget && user.budget > 0) {
        const budgetProducts = await Product.find({ price_inr: { $lte: user.budget } })
          .sort({ rating: -1 }).limit(6).lean();
        if (budgetProducts.length > 0) {
          sections.push({
            id: 'budget',
            title: `Within Your ₹${user.budget.toLocaleString('en-IN')} Budget`,
            subtitle: 'Great picks that match your budget',
            products: budgetProducts,
          });
        }
      }

      // 4. Products with preferred ingredients
      if (user.preferredIngredients && user.preferredIngredients.length > 0) {
        const ingFilter = {
          key_ingredients: { $in: user.preferredIngredients.map(i => new RegExp(i, 'i')) },
        };
        const ingProducts = await Product.find(ingFilter).sort({ rating: -1 }).limit(6).lean();
        if (ingProducts.length > 0) {
          sections.push({
            id: 'ingredients',
            title: 'Products With Your Ingredients',
            subtitle: user.preferredIngredients.slice(0, 3).join(', '),
            products: ingProducts,
          });
        }
      }
    }

    // 5. Trending (always included as fallback / extra section)
    const trending = await Product.find({}).sort({ rating: -1 }).limit(6).lean();
    sections.push({
      id: 'trending',
      title: 'Trending Now',
      subtitle: 'Top rated products on Joyory',
      products: trending,
    });
    
    // Track business metric for personalized product matches
    sections.forEach(section => {
      let bucket = '50-69%';
      if (section.id === 'recommended') bucket = '90-100%';
      else if (section.id.startsWith('category') || section.id === 'ingredients') bucket = '70-89%';
      
      if (section.id !== 'trending') {
        productMatchedTotal.inc({ match_score_bucket: bucket }, section.products.length);
      }
    });

    res.status(200).json({
      message: `Welcome back, ${user.name}!`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skinType: user.skinType || null,
        concerns: user.concerns || [],
        budget: user.budget || null,
        shoppingGoals: user.shoppingGoals || [],
        onboardingCompleted: Boolean(user.onboardingCompleted),
        coinsBalance: user.coinsBalance || 0,
        createdAt: user.createdAt,
      },
      sections,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Something went wrong loading the dashboard.' });
  }
}

module.exports = { getDashboard };

