const mongoose = require('mongoose');

const bookingInfoSchema = new mongoose.Schema(
  {
    booking_info_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      comment: 'Sử dụng làm vnp_TxnRef'
    },
    user_id: {
      type: String,
      ref: 'users',
      required: false,
      default: null
    },
    tour_id: {
      type: String,
      required: true
    },
    contact_info: {
      full_name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      note: { type: String, default: "" }
    },
    passengers: [{
      type: { type: String, enum: ['adult', 'child'], default: 'adult' },
      name: { type: String, default: "Hành khách" },
      gender: { type: String, default: "Nam" },
      dob: { type: String, default: "" }
    }],
    adult_count: {
      type: Number,
      required: true,
      default: 1
    },
    child_count: {
      type: Number,
      required: true,
      default: 0
    },
    total_price: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('booking_infos', bookingInfoSchema);
