const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    user_name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['customer', 'guide', 'admin'],
      default: 'customer'
    }
  },
  {
    timestamps: true // Tự động tạo createdAt và updatedAt
  }
);

module.exports = mongoose.model('users', userSchema);