const Category = require('../models/category.model');

/**
 * @desc    Lấy tất cả danh mục
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
    try {
        // Sắp xếp theo ngày tạo mới nhất
        const categories = await Category.find({}).sort({ createdAt: -1 });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy danh mục', error: error.message });
    }
};

/**
 * @desc    Tạo một danh mục mới
 * @route   POST /api/categories
 * @access  Admin
 */
const createCategory = async (req, res) => {
    try {
        const { name, slug } = req.body;

        if (!name || !slug) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đủ Tên hiển thị và Slug.' });
        }

        // Kiểm tra xem name hoặc slug đã tồn tại chưa
        const categoryExists = await Category.findOne({ $or: [{ name }, { slug }] });
        if (categoryExists) {
            return res.status(400).json({ message: 'Tên hoặc Slug của danh mục đã tồn tại.' });
        }

        const category = new Category({ name, slug });
        const createdCategory = await category.save();

        res.status(201).json(createdCategory);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi tạo danh mục', error: error.message });
    }
};

/**
 * @desc    Cập nhật một danh mục
 * @route   PUT /api/categories/:id
 * @access  Admin
 */
const updateCategory = async (req, res) => {
    try {
        const { name, slug } = req.body;
        const category = await Category.findById(req.params.id);

        if (category) {
            category.name = name || category.name;
            category.slug = slug || category.slug;

            const updatedCategory = await category.save();
            res.status(200).json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Không tìm thấy danh mục.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi cập nhật danh mục', error: error.message });
    }
};

/**
 * @desc    Xóa một danh mục
 * @route   DELETE /api/categories/:id
 * @access  Admin
 */
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (category) {
            await category.deleteOne();
            res.status(200).json({ message: 'Danh mục đã được xóa.' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy danh mục.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi xóa danh mục', error: error.message });
    }
};


module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};