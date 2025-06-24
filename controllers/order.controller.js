// controllers/order.controller.js (PHIÊN BẢN GỠ LỖI)
const OrderModel = require('../models/order.model');

async function createOrder(req, res) {
    // Log 1: Kiểm tra xem request có vào đến đây không và dữ liệu trông như thế nào.
    console.log('[Controller] Received request to create order. Body:', JSON.stringify(req.body, null, 2));

    try {
        const orderData = req.body;

        if (!orderData || !orderData.customer || !orderData.items || orderData.items.length === 0) {
            console.log('[Controller] Order data validation failed: Missing required fields.');
            return res.status(400).json({ message: 'Dữ liệu đơn hàng không hợp lệ.' });
        }

        // Log 2: Chuẩn bị gọi hàm create của Model
        console.log('[Controller] Calling OrderModel.create...');
        const newOrder = await OrderModel.create(orderData);
        
        // Log 3: Dữ liệu đã được lưu thành công và trả về từ Model
        console.log('[Controller] Order created successfully in DB with ID:', newOrder._id);

        res.status(201).json(newOrder);

    } catch (error) {
        // Log 4: Nếu có lỗi ở bất kỳ đâu trong khối try, nó sẽ nhảy vào đây
        console.error('❌ [Controller] SERVER ERROR WHEN CREATING ORDER:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Lỗi xác thực dữ liệu: ' + error.message });
        }
        res.status(500).json({ message: 'Lỗi server khi tạo đơn hàng.', error: error.message });
    }
}

// Hàm getAllOrders giữ nguyên
async function getAllOrders(req, res) {
    try {
        const orders = await OrderModel.findAll();
        res.status(200).json(orders);
    } catch (error) {
        console.error('SERVER ERROR WHEN GETTING ORDERS:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách đơn hàng.', error: error.message });
    }
}

module.exports = {
    createOrder,
    getAllOrders
};