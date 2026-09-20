const Product = require('../models/Product');

/**
 * GET /api/products
 * Supports: ?search=, ?category=, ?budget_tier=, ?skin_type=, ?sort=, ?limit=, ?page=
 */
async function getAllProducts(req, res) {
  try {
    const {
      search = '',
      category = '',
      budget_tier = '',
      skin_type = '',
      min_price = 0,
      max_price = 100000,
      sort = 'rating',
      limit = 60,
      page = 1,
    } = req.query;

    const filter = {};

    if (category && category !== 'All') {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    if (budget_tier) {
      filter.budget_tier = { $regex: new RegExp(`^${budget_tier}$`, 'i') };
    }
    // Skin type filter: match the requested skin type as well as universally suitable formulas ('All')
    if (skin_type && skin_type !== 'All') {
      filter.skin_types = { $in: [new RegExp(`^${skin_type}$`, 'i'), /^All$/i] };
    }
    if (min_price || max_price < 100000) {
      filter.price_inr = { $gte: Number(min_price), $lte: Number(max_price) };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { concerns: { $regex: search, $options: 'i' } },
        { key_ingredients: { $regex: search, $options: 'i' } },
      ];
    }

    const sortMap = {
      rating: { rating: -1 },
      price_asc: { price_inr: 1 },
      price_desc: { price_inr: -1 },
      name: { name: 1 },
    };

    const sortOpt = sortMap[sort] || { rating: -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOpt).skip(skip).limit(Number(limit)).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({ products, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('getAllProducts error:', err);
    res.status(500).json({ message: 'Server error fetching products' });
  }
}

/**
 * GET /api/products/:id
 */
async function getProductById(req, res) {
  try {
    const product = await Product.findOne({ id: req.params.id }).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('getProductById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * GET /api/products/categories
 */
async function getCategories(req, res) {
  try {
    const categories = await Product.distinct('category');
    res.json(categories.filter(Boolean).sort());
  } catch (err) {
    // Log unexpected errors for troubleshooting
    console.error('getCategories error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * GET /api/products/:id/recommendations
 * Returns up to 6 products from same category, excluding current
 */
async function getRecommendations(req, res) {
  try {
    const product = await Product.findOne({ id: req.params.id }).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const recs = await Product.find({
      category: product.category,
      id: { $ne: product.id },
    })
      .sort({ rating: -1 })
      .limit(6)
      .lean();

    res.json(recs);
  } catch (err) {
    // Log unexpected errors for troubleshooting
    console.error('getRecommendations error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * GET /api/products/catalog-values
 * Returns distinct catalog values for onboarding / preference forms.
 */
async function getCatalogValues(req, res) {
  try {
    const [categories, concerns, ingredients, skinTypes, skinTones, budgetTiers] = await Promise.all([
      Product.distinct('category'),
      Product.distinct('concerns'),
      Product.distinct('key_ingredients'),
      Product.distinct('skin_types'),
      Product.distinct('skin_tones'),
      Product.distinct('budget_tier'),
    ]);

    res.json({
      categories: categories.filter(Boolean).sort(),
      concerns: concerns.filter(Boolean).sort(),
      ingredients: ingredients.filter(Boolean).sort(),
      skinTypes: skinTypes.filter(Boolean).sort(),
      skinTones: skinTones.filter(Boolean).sort(),
      budgetTiers: budgetTiers.filter(Boolean).sort(),
    });
  } catch (err) {
    console.error('getCatalogValues error:', err);
    res.status(500).json({ message: 'Server error fetching catalog values' });
  }
}

module.exports = { getAllProducts, getProductById, getCategories, getRecommendations, getCatalogValues };
