const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',  // Liên kết với Category
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String,
        required: false, // Ảnh không bắt buộc
    },
}, {
    timestamps: true, // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Product', ProductSchema);
