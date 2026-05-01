const mongoose = require('mongoose');

const vnPaySchema = new mongoose.Schema(
  {
    vnp_TxnRef: {
      type: String,
      required: true,
      unique: true,
      comment: 'Mã tham chiếu giao dịch (booking_id)'
    },
    vnp_Amount: {
      type: Number,
      required: true,
      comment: 'Số tiền thanh toán (VND)'
    },
    vnp_BankCode: {
      type: String,
      comment: 'Mã ngân hàng thanh toán'
    },
    vnp_BankTranNo: {
      type: String,
      comment: 'Mã giao dịch tại ngân hàng'
    },
    vnp_CardType: {
      type: String,
      comment: 'Loại tài khoản/thẻ'
    },
    vnp_OrderInfo: {
      type: String,
      comment: 'Nội dung thanh toán'
    },
    vnp_PayDate: {
      type: String,
      comment: 'Thời gian thanh toán ghi nhận tại VNPAY (YYYYMMDDHHmmss)'
    },
    vnp_ResponseCode: {
      type: String,
      required: true,
      comment: 'Mã phản hồi từ VNPAY (00 là thành công)'
    },
    vnp_TmnCode: {
      type: String,
      comment: 'Mã website của merchant'
    },
    vnp_TransactionNo: {
      type: String,
      comment: 'Mã giao dịch ghi nhận tại hệ thống VNPAY'
    },
    vnp_TransactionStatus: {
      type: String,
      comment: 'Mã trạng thái thanh toán từ VNPAY'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('vnpays', vnPaySchema);
