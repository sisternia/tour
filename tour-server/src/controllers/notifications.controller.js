const Notification = require('../models/notifications.model');

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách thông báo'
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndUpdate(notificationId, { is_read: true });

    res.status(200).json({
      success: true,
      message: 'Đã đánh dấu là đã đọc'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật thông báo'
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany({ user_id: userId, is_read: false }, { is_read: true });

    res.status(200).json({
      success: true,
      message: 'Đã đánh dấu tất cả là đã đọc'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật thông báo'
    });
  }
};

exports.createNotification = async (userId, title, message, type, relatedId) => {
  try {
    const newNotification = new Notification({
      user_id: userId,
      title,
      message,
      type,
      related_id: relatedId
    });
    await newNotification.save();
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};
