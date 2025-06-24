// routes/order.routes.js
const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller.js');

router.post('/', OrderController.createOrder);
router.get('/', OrderController.getAllOrders);

module.exports = router;