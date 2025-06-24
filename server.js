// server.js (Đã gỡ bỏ đơn hàng)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./database/db');

// Chỉ import các routes cần thiết
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');

connectDB();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static('public'));

// Chỉ đăng ký các routes cần thiết
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});