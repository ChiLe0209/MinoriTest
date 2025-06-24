require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // Thêm module 'path'
const connectDB = require('./database/db');

// Import tất cả các routes
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const categoryRoutes = require('./routes/category.routes');

connectDB();

const app = express();

// --- SỬA ĐỔI QUAN TRỌNG ---
// Dòng này sẽ lấy cổng (port) mà Render cung cấp.
// Nếu không có (khi chạy ở máy bạn), nó sẽ mặc định là 8000.
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static('public'));

// Đăng ký tất cả các routes với Express
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);

// Route này sẽ phục vụ file admin.html khi người dùng truy cập /admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
    // Thay đổi log để hiển thị đúng port đang chạy
    console.log(`✅ Server is running on port ${PORT}`);
});