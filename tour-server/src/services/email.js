const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Mã xác thực tài khoản Tour Mate",
    html: `
      <h3>Mã OTP của bạn là: ${otp}</h3>
      <p>Mã này có hiệu lực trong 10 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

exports.sendBookingEmail = async (email, bookingData) => {
    const { 
        customerName, 
        bookingId, 
        bookingTime, 
        tourName, 
        dateStart, 
        dateEnd, 
        adultCount, 
        childCount, 
        passengers, 
        guides, 
        totalPrice, 
        status 
    } = bookingData;

    const statusMap = {
        'paid': '<span style="color: #10b981; font-weight: bold;">Đã thanh toán</span>',
        'pending': '<span style="color: #f59e0b; font-weight: bold;">Đang chờ thanh toán</span>',
        'confirmed': '<span style="color: #3b82f6; font-weight: bold;">Đã xác nhận</span>',
        'cancelled': '<span style="color: #ef4444; font-weight: bold;">Đã hủy</span>'
    };

    const passengerHtml = passengers.map(p => `
        <div style="padding: 10px; background: #f8fafc; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; font-weight: bold;">${p.name}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">
                ${p.type === 'adult' ? 'Người lớn' : 'Trẻ em'} | ${p.gender} | Ngày sinh: ${p.dob ? new Date(p.dob).toLocaleDateString('vi-VN') : '---'}
            </p>
        </div>
    `).join('');

    const guideHtml = guides.length > 0 ? guides.map(g => `
        <div style="padding: 10px; background: #f0fdf4; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0; font-weight: bold;">${g.full_name}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #166534;">SĐT: ${g.phone} | Email: ${g.email}</p>
        </div>
    `).join('') : '<p style="font-style: italic; color: #94a3b8;">Chưa gán hướng dẫn viên</p>';

    const mailOptions = {
        from: `"Tour Mate" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `[Tour Mate] Thông báo trạng thái đơn hàng #${bookingId}`,
        html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                <div style="background: #3b82f6; padding: 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Thông tin đơn hàng</h1>
                </div>
                <div style="padding: 24px;">
                    <p>Xin chào <strong>${customerName}</strong>,</p>
                    <p>Chúng tôi gửi đến bạn thông tin chi tiết về đơn hàng đặt tour của bạn tại <strong>Tour Mate</strong>.</p>
                    
                    <div style="margin-top: 24px; padding: 20px; background: #f1f5f9; border-radius: 12px;">
                        <h3 style="margin-top: 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px;">Chi tiết đơn hàng</h3>
                        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; color: #64748b;">Mã đơn hàng:</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">#${bookingId}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b;">Thời gian đặt:</td><td style="padding: 8px 0; text-align: right;">${bookingTime}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b;">Trạng thái:</td><td style="padding: 8px 0; text-align: right;">${statusMap[status] || status}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b;">Tổng cộng:</td><td style="padding: 8px 0; text-align: right; font-size: 18px; color: #3b82f6; font-weight: 800;">${totalPrice.toLocaleString('vi-VN')}đ</td></tr>
                        </table>
                    </div>

                    <div style="margin-top: 24px;">
                        <h3 style="color: #3b82f6; border-left: 4px solid #3b82f6; padding-left: 10px;">Thông tin Tour</h3>
                        <p style="font-weight: bold; font-size: 16px; margin: 8px 0;">${tourName}</p>
                        <p style="font-size: 14px; color: #64748b;">
                            <span style="display: inline-block; margin-right: 15px;">📅 ${dateStart} - ${dateEnd}</span>
                            <span>👥 ${adultCount} Người lớn, ${childCount} Trẻ em</span>
                        </p>
                    </div>

                    <div style="margin-top: 24px;">
                        <h3 style="color: #3b82f6; border-left: 4px solid #3b82f6; padding-left: 10px;">Danh sách hành khách</h3>
                        ${passengerHtml}
                    </div>

                    <div style="margin-top: 24px;">
                        <h3 style="color: #22c55e; border-left: 4px solid #22c55e; padding-left: 10px;">Hướng dẫn viên đoàn</h3>
                        ${guideHtml}
                    </div>

                    <div style="margin-top: 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                        <p>Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của Tour Mate!</p>
                        <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline: 1900 xxxx</p>
                    </div>
                </div>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};
