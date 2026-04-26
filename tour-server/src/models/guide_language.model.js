const mongoose = require('mongoose');

const guideLanguageSchema = new mongoose.Schema(
  {
    guide_lan_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    guide_lan_name: {
      type: String,
      required: true,
      trim: true
    },
    country_code: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('guide_language', guideLanguageSchema);
