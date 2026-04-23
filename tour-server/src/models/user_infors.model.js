const mongoose = require('mongoose');

const userInfoSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      unique: true
    },
    full_name: {
      type: String,
      default: null
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    dob: {
      type: Date // Date of Birth
    },
    add: {
      type: String // Address
    },
    bio: {
      type: String
    },
    avatar: {
      type: String,
      default: ''
    },
    background: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true // Tự động tạo createdAt và updatedAt
  }
);

module.exports = mongoose.model('user_infos', userInfoSchema);