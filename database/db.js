const mongoose = require('mongoose');

// Dòng này không cần thiết nữa vì model sẽ được load qua controller
// const Product = require('../models/product.model'); 

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        // Chạy seed data sau khi kết nối thành công
        await seedSampleProducts();
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

async function seedSampleProducts() {
    try {
        // Lấy model Product đã được đăng ký với Mongoose
        const Product = mongoose.model('Product');
        
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log('Database is empty. Seeding sample data...');
            await Product.insertMany([
                { ma_hang: "UB001", ten_hang: "Giày UltraBoost", gia_ban: 4500000, danh_muc: "running", ton_kho: 50, hinh_anh: "https://via.placeholder.com/300x300.png?text=Giay+Chay+Bo", thuong_hieu: "Adidas", mo_ta_chi_tiet: "Mô tả cho giày." },
                { ma_hang: "AGP002", ten_hang: "Áo Tập Gym Pro", gia_ban: 850000, danh_muc: "gym", ton_kho: 100, hinh_anh: "https://via.placeholder.com/300x300.png?text=Ao+Gym", thuong_hieu: "Nike", mo_ta_chi_tiet: "Mô tả cho áo." },
                { ma_hang: "QDX003", ten_hang: "Quần Đạp Xe Fit", gia_ban: 1200000, danh_muc: "cycling", ton_kho: 75, hinh_anh: "https://via.placeholder.com/300x300.png?text=Quan+Dap+Xe", thuong_hieu: "Fit", mo_ta_chi_tiet: "Mô tả cho quần." }
            ]);
            console.log('✅ Sample data seeded.');
        }
    } catch (error) {
        // Bỏ qua lỗi nếu model chưa sẵn sàng, điều này có thể xảy ra khi khởi động lần đầu
        // console.error('Error seeding data:', error.message);
    }
}

module.exports = connectDB;