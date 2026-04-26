const mongoose = require('mongoose');

const tourPriceSchema = new mongoose.Schema(
  {
    tour_price_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    tour_capacity: {
      type: Number,
      required: true
    },
    price_child: {
      type: Number,
      required: true
    },
    price_adult: {
      type: Number,
      required: true
    },
    tour_id: {
      type: String,
      required: true,
      ref: 'tours'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('tour_prices', tourPriceSchema);
