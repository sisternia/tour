const User = require("../models/users.model");
const UserInfo = require("../models/user_infors.model");
const Verify = require("../models/verifies.model");
const BookingInfo = require("../models/booking_infos.model");
const Tour = require("../models/tours.model");
const TourImg = require("../models/tour_imgs.model");
const TourTime = require("../models/tour_times.model");
const mongoose = require("mongoose");
const emailService = require("../services/email");
const passwordService = require("../services/password");
const { uploadImage, deleteImage } = require("../services/cloudinary");

exports.register = async (req, res) => {
  try {
    const { user_name, email, password } = req.body;

    const existingUser = await User.findOne({ user_name });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Tên đăng nhập đã tồn tại",
      });
    }

    const existingEmail = await UserInfo.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng bởi một tài khoản khác",
      });
    }

    const hashedPassword = await passwordService.hashPassword(password);

    const newUser = new User({
      user_id: new mongoose.Types.ObjectId().toString(),
      user_name,
      password: hashedPassword,
      role: "customer",
    });
    const savedUser = await newUser.save();

    const newUserInfo = new UserInfo({
      user_id: savedUser._id,
      full_name: null,
      email,
      phone: null,
      dob: null,
      add: null,
      bio: null,
      avatar: "",
      background: "",
    });
    await newUserInfo.save();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Verify.findOneAndUpdate(
      { user_id: savedUser._id },
      {
        verifies_code: otp,
        verifies_status: 0,
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
      },
      { upsert: true, returnDocument: "after" },
    );

    await emailService.sendOTP(email, otp);

    res.status(201).json({
      success: true,
      message:
        "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác thực!",
      data: {
        user_id: savedUser.user_id,
        user_name: savedUser.user_name,
        email: newUserInfo.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Có lỗi xảy ra trong quá trình đăng ký",
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    const userInfo = await UserInfo.findOne({ email });
    if (!userInfo) {
      return res
        .status(404)
        .json({ success: false, message: "Email không tồn tại" });
    }

    const verifyRecord = await Verify.findOne({ user_id: userInfo.user_id });

    if (
      !verifyRecord ||
      !verifyRecord.verifies_code ||
      verifyRecord.verifies_code !== otp ||
      new Date() > verifyRecord.expires_at
    ) {
      if (
        verifyRecord &&
        verifyRecord.verifies_code &&
        new Date() > verifyRecord.expires_at
      ) {
        verifyRecord.verifies_code = null;
        await verifyRecord.save();
      }

      return res.status(400).json({
        success: false,
        message: "Mã xác thực không chính xác hoặc đã hết hạn",
      });
    }

    if (purpose === "verify_account") {
      verifyRecord.verifies_status = 1;
      verifyRecord.verifies_code = null;
      await verifyRecord.save();
    } else if (purpose === "reset_password") {
      verifyRecord.verifies_code = null;
      await verifyRecord.save();
    }

    res.status(200).json({
      success: true,
      message: "Xác thực mã OTP thành công",
      data: {
        email: email,
        purpose: purpose,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi hệ thống khi xác thực OTP",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, new_password } = req.body;

    const userInfo = await UserInfo.findOne({ email });
    if (!userInfo) {
      return res
        .status(404)
        .json({ success: false, message: "Email không tồn tại" });
    }

    const hashedPassword = await passwordService.hashPassword(new_password);

    await User.findByIdAndUpdate(userInfo.user_id, {
      password: hashedPassword,
    });

    res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const userInfo = await UserInfo.findOne({ email });
    if (!userInfo) {
      return res.status(404).json({
        success: false,
        message: "Email không tồn tại trong hệ thống",
      });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    await Verify.findOneAndUpdate(
      { user_id: userInfo.user_id },
      {
        verifies_code: newOtp,
        verifies_status: 0,
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
      },
      { upsert: true, returnDocument: "after" },
    );

    await emailService.sendOTP(email, newOtp);

    res.status(200).json({
      success: true,
      message: "Mã xác thực mới đã được gửi lại vào email của bạn!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi hệ thống khi gửi lại OTP",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { user_name, password } = req.body;

    const user = await User.findOne({ user_name });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Tên đăng nhập không tồn tại" });
    }

    const isMatch = await passwordService.comparePassword(
      password,
      user.password,
    );
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Mật khẩu không chính xác" });
    }

    const verifyRecord = await Verify.findOne({ user_id: user._id });

    if (!verifyRecord || verifyRecord.verifies_status === 0) {
      const userInfo = await UserInfo.findOne({ user_id: user._id });
      return res.status(403).json({
        success: false,
        message:
          "Tài khoản chưa được xác thực. Vui lòng kiểm tra mã OTP trong email.",
        email: userInfo ? userInfo.email : null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user_id: user.user_id,
        user_name: user.user_name,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;

    const userInfo = await UserInfo.findOne({ email });

    if (!userInfo) {
      return res.status(404).json({
        success: false,
        message: "Email này không tồn tại trong hệ thống",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Verify.findOneAndUpdate(
      { user_id: userInfo.user_id },
      {
        verifies_code: otp,
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
      },
      { upsert: true, returnDocument: "after" },
    );

    await emailService.sendOTP(email, otp);

    // 5. Trả về phản hồi thành công
    res.status(200).json({
      success: true,
      message:
        "Mã xác thực đã được gửi thành công. Vui lòng kiểm tra hộp thư đến của bạn!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi hệ thống khi kiểm tra email",
    });
  }
};

exports.view_customer = async (req, res) => {
  try {
    const customers = await UserInfo.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $match: {
          "user.role": "customer",
        },
      },
      {
        $lookup: {
          from: "verifies",
          localField: "user_id",
          foreignField: "user_id",
          as: "verification",
        },
      },
      {
        $unwind: {
          path: "$verification",
          preserveNullAndEmptyArrays: true,
        },
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
          verifies_status: { $ifNull: ["$verification.verifies_status", 0] },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách khách hàng",
    });
  }
};

exports.checkEmailMatchUser = async (req, res) => {
  try {
    const { user_name, email } = req.body;

    const user = await User.findOne({ user_name });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Tên đăng nhập không tồn tại" });
    }

    const userInfo = await UserInfo.findOne({ user_id: user._id, email });
    if (!userInfo) {
      return res.status(400).json({
        success: false,
        message: "Email không chính xác.\nVui lòng kiểm tra lại.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Verify.findOneAndUpdate(
      { user_id: user._id },
      {
        verifies_code: otp,
        verifies_status: 0,
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
      },
      { upsert: true, returnDocument: "after" },
    );

    await emailService.sendOTP(email, otp);

    res.status(200).json({
      success: true,
      message: "Mã xác thực đã được gửi thành công đến email: " + email,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Lỗi hệ thống khi kiểm tra email",
      });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { user_name } = req.params;
    const user = await User.findOne({ user_name });
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const userInfo = await UserInfo.findOne({ user_id: user._id });
    if (!userInfo) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thông tin chi tiết" });
    }

    // Fetch User's Bookings (My Tours)
    const rawBookings = await BookingInfo.find({ 
      $or: [
        { user_id: user.user_id },
        { "contact_info.email": userInfo.email }
      ]
    }).sort({ createdAt: -1 }).lean();

    const tours = await Promise.all(rawBookings.map(async (booking) => {
      const tour = await Tour.findOne({ tour_id: booking.tour_id }).lean();
      if (tour) {
        const tourImg = await TourImg.findOne({ tour_id: booking.tour_id, img_is_cover: true }).lean();
        const tourTime = await TourTime.findOne({ tour_id: booking.tour_id }).lean();
        return {
          ...booking,
          tour_id: {
            ...tour,
            tour_image: tourImg ? tourImg.tour_img_url : null,
            time: tourTime || null
          }
        };
      }
      return booking;
    }));

    res.status(200).json({
      success: true,
      data: {
        user_name: user.user_name,
        full_name: userInfo.full_name,
        email: userInfo.email,
        phone: userInfo.phone,
        dob: userInfo.dob,
        add: userInfo.add,
        bio: userInfo.bio,
        avatar: userInfo.avatar,
        background: userInfo.background,
        tours: tours,
        savedTours: [] // Placeholder
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { user_id, full_name, add, phone, dob, bio } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, message: "Thiếu user_id" });
    }

    // Find user by custom user_id string to get the _id (ObjectId)
    const user = await User.findOne({ user_id });
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản người dùng" });
    }

    const userInfo = await UserInfo.findOne({ user_id: user._id });
    if (!userInfo) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thông tin chi tiết người dùng" });
    }

    let updateData = {
      full_name: full_name || userInfo.full_name,
      add: add || userInfo.add,
      phone: phone || userInfo.phone,
      bio: bio || userInfo.bio,
    };

    if (dob) {
      updateData.dob = new Date(dob);
    }

    // Helper function to extract public_id from Cloudinary URL
    const getPublicIdFromUrl = (url) => {
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/");
        const uploadIdx = pathParts.indexOf("upload");
        if (uploadIdx !== -1) {
          let afterUpload = pathParts.slice(uploadIdx + 1);
          if (afterUpload[0].startsWith("v") && !isNaN(afterUpload[0].substring(1))) {
            afterUpload = afterUpload.slice(1);
          }
          const publicIdWithExt = afterUpload.join("/");
          return decodeURIComponent(publicIdWithExt.replace(/\.[^/.]+$/, ""));
        }
      } catch (err) {
        console.error("Error parsing Cloudinary URL:", err);
      }
      return null;
    };

    const uploadPromises = [];

    // Handle Avatar Upload
    if (req.files && req.files.avatar) {
      const avatarTask = async () => {
        // Delete old avatar
        if (userInfo.avatar && userInfo.avatar.includes("cloudinary.com")) {
          const oldPublicId = getPublicIdFromUrl(userInfo.avatar);
          if (oldPublicId) await deleteImage(oldPublicId);
        }
        // Upload new avatar
        const folderPath = `customer/${user_id}/avatar`;
        const uploadResult = await uploadImage(req.files.avatar[0].buffer, folderPath);
        updateData.avatar = uploadResult.secure_url;
      };
      uploadPromises.push(avatarTask());
    }

    // Handle Background Upload
    if (req.files && req.files.background) {
      const backgroundTask = async () => {
        // Delete old background
        if (userInfo.background && userInfo.background.includes("cloudinary.com")) {
          const oldPublicId = getPublicIdFromUrl(userInfo.background);
          if (oldPublicId) await deleteImage(oldPublicId);
        }
        // Upload new background
        const folderPath = `customer/${user_id}/background`;
        const uploadResult = await uploadImage(req.files.background[0].buffer, folderPath);
        updateData.background = uploadResult.secure_url;
      };
      uploadPromises.push(backgroundTask());
    }

    // Wait for all uploads to complete
    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    }

    const updatedUserInfo = await UserInfo.findOneAndUpdate(
      { user_id: user._id },
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật hồ sơ thành công",
      data: updatedUserInfo,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: error.message || "Lỗi cập nhật hồ sơ" });
  }
};
