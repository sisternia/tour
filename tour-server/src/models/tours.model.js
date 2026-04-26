const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    tour_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    tour_name: {
      type: String,
      required: true,
      trim: true
    },
    tour_desc: {
      type: String,
      default: ''
    },
    tour_type: {
      type: String,
      enum: ['Nội địa', 'Quốc tế'],
      required: true
    },
    tour_add: {
      type: String,
      default: ''
    },
    tour_longit: {
      type: Number,
      default: null
    },
    tour_latit: {
      type: Number,
      default: null
    },
    tour_status: {
      type: String,
      enum: ['Đang hoạt động', 'Tạm dừng', 'Đã hủy', 'Bản nháp'],
      default: 'Bản nháp'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('tours', tourSchema);
