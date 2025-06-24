const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    ma_hang: { type: String, required: true, unique: true, trim: true },
    ten_hang: { type: String, required: true, trim: true },
    thuong_hieu: { type: String, default: '', trim: true },
    danh_muc: { type: String, required: true, trim: true },
    gia_ban: { type: Number, required: true, min: 0, default: 0 },
    ton_kho: { type: Number, required: true, min: 0, default: 0 },
    hinh_anh: { type: String, required: true },
    mo_ta_chi_tiet: { type: String, default: 'Chưa có mô tả chi tiết cho sản phẩm này.' }
}, {
    timestamps: true,
    collection: 'products'
});

// Chuyển hàm findAll thành một phương thức tĩnh (static method) của schema
productSchema.statics.findAll = async function(page = 1, limit = 10, category = null) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    const filter = {};
    if (category && category !== 'all') {
        filter.danh_muc = category;
    }

    // "this" ở đây chính là model "Product"
    const [products, totalProducts] = await Promise.all([
        this.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        this.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalProducts / limitNum);

    return { products, totalProducts, totalPages, currentPage: pageNum };
};

// Biên dịch và export trực tiếp model, không cần export object chứa các hàm nữa
const Product = mongoose.model('Product', productSchema);
module.exports = Product;