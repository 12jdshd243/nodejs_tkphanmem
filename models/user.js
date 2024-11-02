const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, unique: true } // Nếu bạn cần trường này
});

// Tạo model từ schema
const User = mongoose.model('User', userSchema);

// Xuất model để sử dụng ở nơi khác
module.exports = User;
