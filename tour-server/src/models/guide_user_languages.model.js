const mongoose = require('mongoose');

const guideUserLanguageSchema = new mongoose.Schema(
  {
    gu_lan_id: {
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
    guide_lan_id: {
      type: String,
      required: true,
      ref: 'guide_language'
    }
  },
  {
    timestamps: true
  }
);

// This junction model implements the many-to-many relationship:
// A user (guide) can have multiple languages.
// A language can belong to multiple users (guides).
module.exports = mongoose.model('guide_user_languages', guideUserLanguageSchema);
