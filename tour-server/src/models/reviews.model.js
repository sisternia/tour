const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    tour_id: {
      type: String,
      required: true,
      ref: 'tours'
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'users'
    },
    booking_id: {
      type: String,
      required: true,
      unique: true,
      ref: 'booking_infos'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      default: ''
    },
    images: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('reviews', reviewSchema);
