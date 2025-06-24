// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./database/db');

// Import tất cả các routes
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const categoryRoutes = require('./routes/category.routes'); // Đảm bảo có dòng này

connectDB();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static('public'));

// Đăng ký tất cả các routes với Express
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes); // Đảm bảo có dòng này

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});