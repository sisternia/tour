const mongoose = require('mongoose');

const guideUserFieldSchema = new mongoose.Schema(
  {
    gu_fie_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    user_id: {
      type: String,
      required: true,
      ref: 'users'
    },
    guide_fie_id: {
      type: String,
      required: true,
      ref: 'guide_fields'
    }
  },
  {
    timestamps: true
  }
);

// This junction model implements the many-to-many relationship:
// A user (guide) can have multiple expertise fields.
// A field can belong to multiple users (guides).
module.exports = mongoose.model('guide_user_fields', guideUserFieldSchema);
