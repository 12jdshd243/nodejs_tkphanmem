const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product', // Đảm bảo rằng 'Product' là tên model mà bạn đã định nghĩa
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    }
});

const CartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Đảm bảo rằng 'User' là tên model mà bạn đã định nghĩa
        required: true
    },
    items: [CartItemSchema], // Sửa 'products' thành 'items' nếu bạn đang sử dụng 'items'
    total: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cart', CartSchema);
