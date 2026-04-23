const mongoose = require('mongoose');

const verifySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    verifies_code: {
      type: String,
      default: null 
    },
    verifies_status: {
      type: Number,
      default: 0 
    },
    expires_at: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000) 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('verifies', verifySchema);