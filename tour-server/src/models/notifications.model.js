const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['booking_created', 'booking_paid', 'booking_confirmed', 'booking_cancelled', 'system'],
      required: true
    },
    related_id: {
      type: String, // booking_info_id or other related ID
      default: null
    },
    is_read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('notifications', notificationSchema);
