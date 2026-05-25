const mongoose = require('mongoose');
const Review = require('../models/reviews.model');
const BookingInfo = require('../models/booking_infos.model');
const UserInfo = require('../models/user_infors.model');
const { uploadImage } = require('../services/cloudinary.service');

// POST /api/reviews/create
exports.createReview = async (req, res) => {
  try {
    const { tour_id, booking_id, rating, comment } = req.body;
    const user_id = req.user?._id || req.body.user_id;

    if (!tour_id || !booking_id || !rating || !user_id) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }

    // Check booking belongs to user and is confirmed
    const booking = await BookingInfo.findOne({
      booking_info_id: booking_id,
      user_id: user_id.toString(),
      status: 'confirmed'
    });

    if (!booking) {
      return res.status(403).json({ success: false, message: 'Đơn hàng không hợp lệ hoặc chưa được xác nhận' });
    }

    // Check not already reviewed for this booking
    const existing = await Review.findOne({ booking_id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Đơn hàng này đã được đánh giá' });
    }

    // Upload images
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const folderPath = `customer/${user_id}/rating/${tour_id}`;
        const result = await uploadImage(file.buffer, folderPath);
        imageUrls.push(result.secure_url);
      }
    }

    const review = new Review({
      review_id: new mongoose.Types.ObjectId().toString(),
      tour_id,
      user_id,
      booking_id,
      rating: Number(rating),
      comment: comment || '',
      images: imageUrls
    });

    await review.save();

    res.status(201).json({ success: true, message: 'Đánh giá thành công', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi tạo đánh giá' });
  }
};

// GET /api/reviews/tour/:tour_id
exports.getReviewsByTour = async (req, res) => {
  try {
    const { tour_id } = req.params;
    const reviews = await Review.find({ tour_id }).sort({ createdAt: -1 });

    const enriched = await Promise.all(
      reviews.map(async (r) => {
        const userInfo = await UserInfo.findOne({ user_id: r.user_id });
        let fullName = userInfo?.full_name;
        if (!fullName) {
          const bookingInfo = await BookingInfo.findOne({ booking_info_id: r.booking_id });
          fullName = bookingInfo?.contact_info?.full_name || 'Người dùng';
        }

        return {
          ...r._doc,
          user: {
            full_name: fullName,
            avatar: userInfo?.avatar || null
          }
        };
      })
    );

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
        : 0;

    res.status(200).json({
      success: true,
      data: enriched,
      averageRating,
      totalReviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy đánh giá' });
  }
};

// GET /api/reviews/user/:user_id/images
exports.getUserReviewImages = async (req, res) => {
  try {
    const { user_id } = req.params;
    const reviews = await Review.find({ user_id, images: { $not: { $size: 0 } } }).sort({ createdAt: -1 });
    const images = reviews.flatMap((r) => r.images);
    res.status(200).json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy ảnh đánh giá' });
  }
};

// GET /api/reviews/can-review/:tour_id?user_id=xxx
exports.getReviewableBookings = async (req, res) => {
  try {
    const { tour_id } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'Thiếu user_id' });
    }

    // Confirmed bookings for this tour by this user
    const confirmedBookings = await BookingInfo.find({
      tour_id,
      user_id: user_id.toString(),
      status: 'confirmed'
    });

    // Filter out already-reviewed ones
    const alreadyReviewed = await Review.find({
      booking_id: { $in: confirmedBookings.map((b) => b.booking_info_id) }
    });
    const reviewedIds = new Set(alreadyReviewed.map((r) => r.booking_id));

    const available = confirmedBookings
      .filter((b) => !reviewedIds.has(b.booking_info_id))
      .map((b) => b.booking_info_id);

    res.status(200).json({ success: true, data: available });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi kiểm tra đánh giá' });
  }
};
