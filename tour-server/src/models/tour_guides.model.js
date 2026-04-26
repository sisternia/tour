const mongoose = require('mongoose');

const tourGuideSchema = new mongoose.Schema(
  {
    tour_guide_id: {
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
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('tour_guides', tourGuideSchema);
