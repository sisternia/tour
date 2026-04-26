const User = require('../models/users.model');
const UserInfo = require('../models/user_infors.model');
const Verify = require('../models/verifies.model');
const GuideLanguage = require('../models/guide_language.model');
const GuideField = require('../models/guide_fields.model');
const GuideUserLanguage = require('../models/guide_user_languages.model');
const GuideUserField = require('../models/guide_user_fields.model');
const mongoose = require('mongoose');
const passwordService = require('../services/password');
const { uploadImage, deleteImage, deleteFolder } = require('../services/cloudinary');

exports.getGuides = async (req, res) => {
  try {
    const guides = await User.find({ role: 'guide' });
    const guideIds = guides.map(g => g._id);
    
    const guidesInfo = await UserInfo.find({ user_id: { $in: guideIds } });
    
    res.status(200).json({
      success: true,
      data: guidesInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách hướng dẫn viên'
    });
  }
};

exports.createGuide = async (req, res) => {
  try {
    const { full_name, email, password, phone, dob, add, bio, languages, fields, verifies_status } = req.body;

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
      verifies_status: (verifies_status !== undefined && verifies_status !== null) ? Number(verifies_status) : 1
    });
    await newVerify.save();

    // Handle languages (Junction table)
    const parsedLanguages = typeof languages === 'string' ? JSON.parse(languages) : languages;
    if (parsedLanguages && Array.isArray(parsedLanguages)) {
      for (const lanId of parsedLanguages) {
        const newGuLan = new GuideUserLanguage({
          gu_lan_id: new mongoose.Types.ObjectId().toString(),
          user_id: savedUser._id,
          guide_lan_id: lanId
        });
        await newGuLan.save();
      }
    }

    // Handle fields (Junction table)
    const parsedFields = typeof fields === 'string' ? JSON.parse(fields) : fields;
    if (parsedFields && Array.isArray(parsedFields)) {
      for (const fieId of parsedFields) {
        const newGuFie = new GuideUserField({
          gu_fie_id: new mongoose.Types.ObjectId().toString(),
          user_id: savedUser._id,
          guide_fie_id: fieId
        });
        await newGuFie.save();
      }
    }

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
          user_id: 1,
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

exports.addLanguage = async (req, res) => {
  try {
    const { guide_lan_name, country_code } = req.body;
    if (!guide_lan_name) {
      return res.status(400).json({ success: false, message: 'Tên ngôn ngữ là bắt buộc' });
    }
    const guide_lan_id = new mongoose.Types.ObjectId().toString();
    const newLanguage = new GuideLanguage({ 
      guide_lan_id, 
      guide_lan_name,
      country_code: country_code ? country_code.toUpperCase() : ''
    });
    await newLanguage.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Thêm ngôn ngữ thành công', 
      data: newLanguage 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Lỗi khi thêm ngôn ngữ' 
    });
  }
};

exports.addField = async (req, res) => {
  try {
    const { guide_fie_name, guide_fie_desc } = req.body;
    if (!guide_fie_name) {
      return res.status(400).json({ success: false, message: 'Tên lĩnh vực là bắt buộc' });
    }
    const guide_fie_id = new mongoose.Types.ObjectId().toString();
    const newField = new GuideField({ guide_fie_id, guide_fie_name, guide_fie_desc });
    await newField.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Thêm lĩnh vực thành công', 
      data: newField 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Lỗi khi thêm lĩnh vực' 
    });
  }
};

exports.getLanguages = async (req, res) => {
  try {
    const languages = await GuideLanguage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: languages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy danh sách ngôn ngữ' });
  }
};

exports.getFields = async (req, res) => {
  try {
    const fields = await GuideField.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: fields });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy danh sách lĩnh vực' });
  }
};

exports.getGuideById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tìm thông tin cơ bản
    const info = await UserInfo.findOne({ user_id: id });
    if (!info) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin hướng dẫn viên' });
    }

    // Tìm ngôn ngữ
    const langRelations = await GuideUserLanguage.find({ user_id: id });
    const languages = langRelations.map(rel => rel.guide_lan_id);

    // Tìm lĩnh vực
    const fieldRelations = await GuideUserField.find({ user_id: id });
    const fields = fieldRelations.map(rel => rel.guide_fie_id);

    // Tìm trạng thái xác nhận
    const verifyRecord = await Verify.findOne({ user_id: id });
    const verifies_status = verifyRecord ? verifyRecord.verifies_status : 0;

    res.status(200).json({
      success: true,
      data: {
        ...info._doc,
        languages,
        fields,
        verifies_status
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Lỗi khi lấy chi tiết hướng dẫn viên' 
    });
  }
};

exports.updateGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, password, phone, dob, add, bio, languages, fields, verifies_status } = req.body;

    const info = await UserInfo.findOne({ user_id: id });
    if (!info) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hướng dẫn viên' });
    }

    // Cập nhật User model
    const userUpdateData = {};
    if (email && email !== info.email) {
      const existingUser = await User.findOne({ user_name: email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
      }
      userUpdateData.user_name = email;
    }

    if (password && password.trim() !== '') {
      userUpdateData.password = await passwordService.hashPassword(password);
    }

    if (Object.keys(userUpdateData).length > 0) {
      await User.findByIdAndUpdate(id, userUpdateData);
    }

    let avatarUrl = info.avatar;
    if (req.file) {
      // Xóa ảnh cũ trên Cloudinary nếu tồn tại
      if (info.avatar && info.avatar.includes('cloudinary.com')) {
        try {
          const urlObj = new URL(info.avatar);
          const pathParts = urlObj.pathname.split('/');
          // pathname: /cloud_name/image/upload/v1234567/folder/subfolder/filename.ext
          const uploadIdx = pathParts.indexOf('upload');
          if (uploadIdx !== -1) {
            // Sau segment 'upload', có thể có segment 'v1234567' (version)
            let afterUpload = pathParts.slice(uploadIdx + 1);
            if (afterUpload[0].startsWith('v') && !isNaN(afterUpload[0].substring(1))) {
              afterUpload = afterUpload.slice(1);
            }
            // Join các phần còn lại để lấy public_id (bao gồm cả folder)
            const publicIdWithExt = afterUpload.join('/');
            // Loại bỏ phần mở rộng file (.jpg, .png, ...)
            const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
            // Giải mã URL (ví dụ: %20 -> space)
            await deleteImage(decodeURIComponent(publicId));
          }
        } catch (err) {
          console.error('Lỗi khi xóa ảnh cũ Cloudinary:', err);
        }
      }

      // Upload ảnh mới vào đúng folder của người dùng
      const guideName = full_name || info.full_name || 'unknown';
      const folderPath = `tour-guide/avatar/${guideName}`;
      const uploadResult = await uploadImage(req.file.buffer, folderPath);
      avatarUrl = uploadResult.secure_url;
    }

    // Cập nhật UserInfo
    await UserInfo.findOneAndUpdate({ user_id: id }, {
      full_name,
      email,
      phone,
      dob,
      add,
      bio,
      avatar: avatarUrl
    });

    // Cập nhật Ngôn ngữ (Xóa cũ - Thêm mới)
    const parsedLanguages = typeof languages === 'string' ? JSON.parse(languages) : languages;
    if (parsedLanguages && Array.isArray(parsedLanguages)) {
      await GuideUserLanguage.deleteMany({ user_id: id });
      for (const lanId of parsedLanguages) {
        await new GuideUserLanguage({
          gu_lan_id: new mongoose.Types.ObjectId().toString(),
          user_id: id,
          guide_lan_id: lanId
        }).save();
      }
    }

    // Cập nhật Lĩnh vực (Xóa cũ - Thêm mới)
    const parsedFields = typeof fields === 'string' ? JSON.parse(fields) : fields;
    if (parsedFields && Array.isArray(parsedFields)) {
      await GuideUserField.deleteMany({ user_id: id });
      for (const fieId of parsedFields) {
        await new GuideUserField({
          gu_fie_id: new mongoose.Types.ObjectId().toString(),
          user_id: id,
          guide_fie_id: fieId
        }).save();
      }
    }

    // Cập nhật trạng thái xác nhận
    if (verifies_status !== undefined && verifies_status !== null && verifies_status !== '') {
      await Verify.findOneAndUpdate(
        { user_id: id },
        { verifies_status: Number(verifies_status) },
        { upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật hướng dẫn viên thành công'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật hướng dẫn viên'
    });
  }
};

exports.deleteGuide = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Xác định folder Cloudinary từ Avatar URL hoặc full_name
    const info = await UserInfo.findOne({ user_id: id });
    if (info) {
      let folderPath = '';
      
      if (info.avatar && info.avatar.includes('cloudinary.com')) {
        try {
          const urlObj = new URL(info.avatar);
          const pathParts = urlObj.pathname.split('/');
          const uploadIdx = pathParts.indexOf('upload');
          if (uploadIdx !== -1) {
            let afterUpload = pathParts.slice(uploadIdx + 1);
            if (afterUpload[0].startsWith('v') && !isNaN(afterUpload[0].substring(1))) {
              afterUpload = afterUpload.slice(1);
            }
            // Loại bỏ tên file ở cuối để lấy đường dẫn folder
            afterUpload.pop(); 
            folderPath = decodeURIComponent(afterUpload.join('/'));
          }
        } catch (err) {
          console.error('Lỗi khi bóc tách folder từ URL:', err);
        }
      }

      // Nếu không bóc tách được từ URL, dùng full_name làm fallback
      if (!folderPath && info.full_name) {
        folderPath = `tour-guide/avatar/${info.full_name}`;
      }

      if (folderPath) {
        try {
          await deleteFolder(folderPath);
        } catch (err) {
          console.error('Lỗi khi thực hiện xóa folder Cloudinary:', err);
        }
      }
    }

    // 2. Xóa dữ liệu trong DB (Thứ tự: các bảng liên kết trước, User sau)
    await GuideUserLanguage.deleteMany({ user_id: id });
    await GuideUserField.deleteMany({ user_id: id });
    await Verify.deleteMany({ user_id: id });
    await UserInfo.deleteOne({ user_id: id });
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Xóa hướng dẫn viên thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa hướng dẫn viên'
    });
  }
};
