const express = require('express');
const router = express.Router();
const authenticate = require("../../middleware/auth");
const {placeOrder, 
trackOrder,
updateOrderStatus, 
cancelOrder,
getUserOrders} = require('../controllers/orderControllers');


router.post('/',authenticate, placeOrder);
router.get('/:orderId',authenticate, trackOrder),
router.put('/:orderId/status',authenticate, updateOrderStatus),
router.delete('/:orderId',authenticate,cancelOrder);
router.get("/my-orders",authenticate, getUserOrders)

module.exports = router;