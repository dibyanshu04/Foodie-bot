const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth");
const {
  placeOrder,
  getUserOrders,
  trackOrder,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderControllers");

router.get("/my-orders", authenticate, getUserOrders);
router.post("/", authenticate, placeOrder);
router.get("/:orderId", authenticate, trackOrder);
router.put("/:orderId/status", authenticate, updateOrderStatus);
router.patch("/:orderId", authenticate, updateOrderStatus);
router.delete("/:orderId", authenticate, cancelOrder);

module.exports = router;
