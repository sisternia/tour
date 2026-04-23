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
