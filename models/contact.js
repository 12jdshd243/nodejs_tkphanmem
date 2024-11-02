const mongoose = require('mongoose');

// Định nghĩa schema cho model Contact
const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        match: /.+\@.+\..+/ // Kiểm tra định dạng email
    },
    phone: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

// Tạo model từ schema
const Contact = mongoose.model('Contact', contactSchema);

// Xuất model Contact
module.exports = Contact;
