const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Tên hiển thị của danh mục là bắt buộc.'],
            trim: true,
            unique: true,
        },
        slug: {
            type: String,
            required: [true, 'Slug của danh mục là bắt buộc.'],
            trim: true,
            unique: true,
            lowercase: true,
        },
    },
    {
        timestamps: true, // Tự động thêm trường createdAt và updatedAt
    }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;