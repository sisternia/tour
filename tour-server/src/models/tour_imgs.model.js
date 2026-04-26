const mongoose = require('mongoose');

const tourImgSchema = new mongoose.Schema(
  {
    tour_img_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    tour_img_url: {
      type: String,
      required: true
    },
    img_is_cover: {
      type: Boolean,
      default: false
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

module.exports = mongoose.model('tour_imgs', tourImgSchema);
