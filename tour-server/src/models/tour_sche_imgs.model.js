const mongoose = require('mongoose');

const tourScheImgSchema = new mongoose.Schema(
  {
    tour_sche_imgs_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    tour_sche_img_url: {
      type: String,
      required: true
    },
    tour_sche_id: {
      type: String,
      required: true,
      ref: 'tour_sches'
    },
    tour_id: {
      type: String,
      required: true,
      ref: 'tours'
    },
    img_is_cover: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('tour_sche_imgs', tourScheImgSchema);
