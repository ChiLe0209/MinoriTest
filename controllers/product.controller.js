// controllers/product.controller.js (Phiên bản có gắn log gỡ lỗi)
const Product = require('../models/product.model');

async function getAllProducts(req, res) {
    console.log('[DEBUG] API /api/products called.'); // Log khi API được gọi
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const category = req.query.category;

        console.log('[DEBUG] Received query params:', req.query); // Log các tham số nhận được

        const query = {};
        if (category && category !== 'all') {
            console.log('[DEBUG] Filtering by category slug:', category); // Log category đang được lọc
            query.danh_muc = category;
        }

        console.log('[DEBUG] Final Mongoose query object:', JSON.stringify(query)); // Log câu query cuối cùng

        const skip = (page - 1) * limit;

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            products,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error('[ERROR] Server error when getting products:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm', error: error.message });
    }
}

// Các hàm khác giữ nguyên không đổi
async function getProductById(req, res) {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
}

async function createProduct(req, res) {
    try {
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo sản phẩm', error: error.message });
    }
}

async function updateProduct(req, res) {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm', error: error.message });
    }
}

async function deleteProduct(req, res) {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
         if (!deletedProduct) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error: error.message });
    }
}

async function importProducts(req, res) {
    try {
        const products = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
        }
        const result = await Product.insertMany(products, { ordered: false });
        res.status(201).json({ 
            message: `Đã import thành công ${result.length} sản phẩm.`,
        });
    } catch (error) {
        if (error.code === 11000) {
             res.status(409).json({ message: 'Lỗi: Có sản phẩm trùng lặp (mã hàng) trong file import.', error: error.message });
        } else {
             res.status(500).json({ message: 'Lỗi khi import sản phẩm.', error: error.message });
        }
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    importProducts,
};