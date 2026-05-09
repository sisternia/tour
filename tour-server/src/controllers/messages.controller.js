const mongoose = require('mongoose');
const Message = require('../models/messages.model');

exports.sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, text } = req.body;
    const newMessage = new Message({
      sender_id,
      receiver_id,
      text
    });
    await newMessage.save();
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi gửi tin nhắn' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const messages = await Message.find({
      $or: [
        { sender_id: user1, receiver_id: user2 },
        { sender_id: user2, receiver_id: user1 }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Get Chat History Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy lịch sử trò chuyện' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    await Message.findByIdAndUpdate(messageId, { is_read: true });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Mark Read Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái' });
  }
};

exports.getConversations = async (req, res) => {
    try {
        const { userId } = req.params;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender_id: userObjectId }, { receiver_id: userObjectId }]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender_id", userObjectId] },
                            "$receiver_id",
                            "$sender_id"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: "user_infos",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "partnerInfo"
                }
            },
            {
                $unwind: {
                    path: "$partnerInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: "$lastMessage._id",
                    text: "$lastMessage.text",
                    createdAt: "$lastMessage.createdAt",
                    is_read: "$lastMessage.is_read",
                    sender_id: "$lastMessage.sender_id",
                    receiver_id: "$lastMessage.receiver_id",
                    partner: {
                        _id: "$_id",
                        full_name: { $ifNull: ["$partnerInfo.full_name", "Người dùng"] },
                        avatar: { $ifNull: ["$partnerInfo.avatar", ""] }
                    }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).json({ success: true, data: conversations });
    } catch (error) {
        console.error('Get Conversations Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách hội thoại' });
    }
};
