const User = require('../models/users.model');
const UserInfo = require('../models/user_infors.model');
const Verify = require('../models/verifies.model');
const mongoose = require('mongoose');
const passwordService = require('../services/password');
const { uploadImage } = require('../services/cloudinary');

exports.createGuide = async (req, res) => {
  try {
    const { full_name, email, password, phone, dob, add, bio } = req.body;

    const existingUser = await User.findOne({ user_name: email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email đã được sử dụng' 
      });
    }

    const hashedPassword = await passwordService.hashPassword(password);

    let avatarUrl = '';
    if (req.file) {
      const folderPath = `tour-guide/avatar/${full_name}`;
      const uploadResult = await uploadImage(req.file.buffer, folderPath);
      avatarUrl = uploadResult.secure_url;
    }

    const newUser = new User({
      user_id: new mongoose.Types.ObjectId().toString(),
      user_name: email,
      password: hashedPassword,
      role: 'guide'
    });
    const savedUser = await newUser.save();

    const newUserInfo = new UserInfo({
      user_id: savedUser._id,
      full_name: full_name || null,
      email: email,
      phone: phone || null,
      dob: dob || null,
      add: add || null,
      bio: bio || null,
      avatar: avatarUrl,
      background: null
    });
    await newUserInfo.save();

    const newVerify = new Verify({
      user_id: savedUser._id,
      verifies_status: 1
    });
    await newVerify.save();

    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản hướng dẫn viên thành công',
      data: {
        user_id: savedUser.user_id,
        user_name: savedUser.user_name,
        role: savedUser.role,
        avatar: avatarUrl
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tạo tài khoản hướng dẫn viên'
    });
  }
};

exports.view_guide = async (req, res) => {
  try {
    const guides = await UserInfo.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'user.role': 'guide'
        }
      },
      {
        $lookup: {
          from: 'verifies',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'verification'
        }
      },
      {
        $project: {
          full_name: 1,
          email: 1,
          phone: 1,
          dob: 1,
          add: 1,
          bio: 1,
          avatar: 1,
          background: 1,
          createdAt: 1,
          role: '$user.role',
          verifies_status: { 
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ['$verification', []] } }, 0] },
              then: { $ifNull: [{ $arrayElemAt: ['$verification.verifies_status', 0] }, 0] },
              else: 0
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: guides
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách hướng dẫn viên'
    });
  }
};
