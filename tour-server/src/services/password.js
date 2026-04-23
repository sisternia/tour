const bcrypt = require('bcrypt');

const saltRounds = 10;

// Mã hóa mật khẩu
exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

// So sánh mật khẩu (dùng cho chức năng Login sau này)
exports.comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};