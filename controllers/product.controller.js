const Product = require('../models/product.model'); // Import trực tiếp Mongoose Model

// Lấy sản phẩm bằng ID
async function getProductById(req, res) {
    try {
        const product = await Product.findById(req.params.id); // Gọi trực tiếp
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error('❌ LỖI SERVER KHI LẤY SẢN PHẨM BẰNG ID:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm', error: error.message });
    }
}

// Lấy các danh mục duy nhất
async function getUniqueCategories(req, res) {
    try {
        const categories = await Product.distinct('danh_muc'); // Gọi trực tiếp
        res.status(200).json(categories);
    } catch (error) {
        console.error('❌ LỖI SERVER KHI LẤY DANH MỤC:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh mục', error: error.message });
    }
} 

// Lấy tất cả sản phẩm (phân trang)
async function getAllProducts(req, res) {
    try {
        const { page, limit, category } = req.query;
        const paginatedData = await Product.findAll(page, limit, category); // Gọi hàm static đã định nghĩa
        res.status(200).json(paginatedData);
    } catch (error) {
        console.error('❌ LỖI SERVER KHI LẤY TẤT CẢ SẢN PHẨM:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm', error: error.message });
    }
}

// Tạo sản phẩm mới
async function createProduct(req, res) {
    try {
        const newProduct = await Product.create(req.body); // Gọi trực tiếp
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('❌ LỖI KHI TẠO SẢN PHẨM:', error);
        res.status(500).json({ message: 'Lỗi khi tạo sản phẩm', error: error.message });
    }
}

// Cập nhật sản phẩm
async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }); // Gọi trực tiếp
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('❌ LỖI KHI CẬP NHẬT SẢN PHẨM:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm', error: error.message });
    }
}

// Xóa sản phẩm
async function deleteProduct(req, res) {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id); // Gọi trực tiếp
        res.status(204).send();
    } catch (error) {
        console.error('❌ LỖI KHI XÓA SẢN PHẨM:', error);
        res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error: error.message });
    }
}

// Import nhiều sản phẩm
async function importProducts(req, res) {
    try {
        const products = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Dữ liệu sản phẩm không hợp lệ hoặc rỗng.' });
        }
        const insertedProducts = await Product.insertMany(products); // Gọi trực tiếp
        res.status(201).json({ 
            message: `Đã import thành công ${insertedProducts.length} sản phẩm.`,
            data: insertedProducts 
        });
    } catch (error) {
        console.error('❌ LỖI SERVER KHI IMPORT SẢN PHẨM:', error); 
        res.status(500).json({ message: 'Lỗi khi import sản phẩm.', error: error.message });
    }
}

module.exports = {
    getProductById,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    importProducts,
    getUniqueCategories 
};
