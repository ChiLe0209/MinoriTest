const Product = require('../models/product.model');
const Category = require('../models/category.model');

// Helper function để tạo slug
function generateSlug(str) {
    str = str.toLowerCase().trim();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/[^a-z0-9\s-]/g, '');
    str = str.replace(/\s+/g, '-');
    str = str.replace(/-+/g, '-');
    return str;
}

// Lấy tất cả sản phẩm (có phân trang và lọc theo danh mục)
async function getAllProducts(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const category = req.query.category;
        const query = {};
        if (category && category !== 'all') {
            query.danh_muc = category;
        }
        const skip = (page - 1) * limit;
        const products = await Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);
        res.status(200).json({ products, currentPage: page, totalPages });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm', error: error.message });
    }
}

// Lấy sản phẩm bằng ID
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

// Tạo sản phẩm mới
async function createProduct(req, res) {
    try {
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo sản phẩm', error: error.message });
    }
}

// Cập nhật sản phẩm
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

// Xóa sản phẩm
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

/**
 * @desc    Import sản phẩm, tự động tạo danh mục mới và bỏ qua mã hàng trùng
 * @route   POST /api/products/import
 * @access  Admin
 */
async function importProducts(req, res) {
    try {
        const productsFromExcel = req.body;
        if (!Array.isArray(productsFromExcel) || productsFromExcel.length === 0) {
            return res.status(400).json({ message: 'Không có dữ liệu hợp lệ để import.' });
        }

        // --- Giai đoạn 1: Xử lý Danh mục ---
        const allCategories = await Category.find({});
        const categoryMap = new Map(allCategories.map(cat => [cat.name.toLowerCase().trim(), cat.slug]));
        
        const newCategoryNames = new Set();
        productsFromExcel.forEach(product => {
            const categoryName = product.danh_muc;
            if (typeof categoryName === 'string' && categoryName.trim()) {
                if (!categoryMap.has(categoryName.toLowerCase().trim())) {
                    newCategoryNames.add(categoryName.trim());
                }
            }
        });

        if (newCategoryNames.size > 0) {
            const newCategoriesToCreate = Array.from(newCategoryNames).map(name => ({
                name: name,
                slug: generateSlug(name)
            }));
            const createdCategories = await Category.insertMany(newCategoriesToCreate, { ordered: false });
            createdCategories.forEach(cat => {
                categoryMap.set(cat.name.toLowerCase().trim(), cat.slug);
            });
        }
        
        // --- Giai đoạn 2: Chuẩn bị danh sách sản phẩm cuối cùng để import ---
        const incomingMaHangs = productsFromExcel.map(p => p.ma_hang).filter(Boolean);
        const existingProducts = await Product.find({ ma_hang: { $in: incomingMaHangs } }).select('ma_hang');
        const existingMaHangsSet = new Set(existingProducts.map(p => p.ma_hang));

        const productsToInsert = [];
        const skippedProducts = [];

        for (const product of productsFromExcel) {
            const categoryName = product.danh_muc;
            const maHang = product.ma_hang;

            if (!maHang || existingMaHangsSet.has(maHang)) {
                skippedProducts.push({ ten_hang: product.ten_hang, reason: `Mã hàng '${maHang}' đã tồn tại hoặc không hợp lệ.` });
                continue;
            }

            const categorySlug = typeof categoryName === 'string' ? categoryMap.get(categoryName.toLowerCase().trim()) : null;

            if (categorySlug) {
                product.danh_muc = categorySlug;
                productsToInsert.push(product);
                existingMaHangsSet.add(maHang);
            } else {
                 skippedProducts.push({ ten_hang: product.ten_hang, reason: `Danh mục '${categoryName}' không hợp lệ.` });
            }
        }
        
        // --- Giai đoạn 3: Thêm sản phẩm mới và Báo cáo kết quả ---
        let importedCount = 0;
        if (productsToInsert.length > 0) {
            const result = await Product.insertMany(productsToInsert);
            importedCount = result.length;
        }

        let message = `Hoàn tất! Đã import thành công ${importedCount} sản phẩm mới.`;
        if (skippedProducts.length > 0) {
            message += ` Đã bỏ qua/thất bại ${skippedProducts.length} sản phẩm.`;
        }

        res.status(201).json({
            message: message,
            successCount: importedCount,
            skippedCount: skippedProducts.length,
            failures: skippedProducts
        });

    } catch (error) {
        console.error('[ERROR] Lỗi không xác định khi import sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi server nghiêm trọng khi import.', error: error.message });
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