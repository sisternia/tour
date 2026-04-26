const mongoose = require('mongoose');

const guideFieldSchema = new mongoose.Schema(
  {
    guide_fie_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    guide_fie_name: {
      type: String,
      required: true,
      trim: true
    },
    guide_fie_desc: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('guide_fields', guideFieldSchema);
