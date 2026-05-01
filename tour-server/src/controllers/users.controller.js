const User = require("../models/users.model");
const UserInfo = require("../models/user_infors.model");
const Verify = require("../models/verifies.model");
const mongoose = require("mongoose");
const emailService = require("../services/email");
const passwordService = require("../services/password");

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
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
