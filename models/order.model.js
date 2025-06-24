const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String, image: String, price: Number,
    quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
    customer: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },
    items: [orderItemSchema],
    total_price: { type: Number, required: true },
    order_date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

const create = async (orderData) => {
    const { customer, items } = orderData;
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder = new Order({ customer, items, total_price: totalPrice });
    return newOrder.save();
};

const findAll = async () => Order.find({}).sort({ order_date: -1 });

module.exports = { create, findAll };