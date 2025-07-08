const express = require('express');
const router = express.Router();
const {placeOrder, 
trackOrder,
updateOrderStatus, 
cancelOrder} = require('../controllers/orderControllers');

router.post('/', placeOrder);
router.get('/:orderId', trackOrder),
router.put('/:orderId/status', updateOrderStatus),
router.delete('/:orderId',cancelOrder);


module.exports = router;