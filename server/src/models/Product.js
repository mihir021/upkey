const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    id:               { type: String, index: true },
    name:             { type: String, required: true },
    brand:            { type: String },
    category:         { type: String, index: true },
    price_inr:        { type: Number },
    skin_type:        { type: String },
    skin_tone:        { type: String },
    concerns:         { type: String },
    key_ingredients:  { type: String },
    budget_tier:      { type: String },
    rating:           { type: Number, default: 4.0 },
    dupe_of:          { type: String, default: '' },
    skin_types:       [String],
    skin_tones:       [String],
    concerns_list:    [String],
    ingredients_list: [String],
    cloudinary_link:  { type: String, default: '' },
    media_type:       { type: String, default: 'image' },
    is_3d:            { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'products' }
);

productSchema.index(
  { name: 'text', brand: 'text', category: 'text', concerns: 'text', key_ingredients: 'text' },
  { weights: { name: 10, brand: 6, category: 5, concerns: 3, key_ingredients: 2 } }
);

module.exports = mongoose.model('Product', productSchema);
