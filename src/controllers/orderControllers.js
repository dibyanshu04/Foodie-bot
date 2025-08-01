const { generatePaymentLink } = require("../../utils/cashfree");
const Order = require("../models/order");

const placeOrder = async (req, res) => {
    try {
        const customerName = req.body.customerName;
        const items = req.body.items;
        const deliveryAddress = req.body.deliveryAddress;

        if(!customerName || !items || !deliveryAddress ){
            return res.status(404).json({message: " customerName, items, deliveryAddress cannot be undefined!"})
        };
        const totalPrice = items.reduce((sum,items) => sum + (items.price * items.quantity),0);
        const order = new Order({
            user: req.user,
            customerName,
            items,
            totalPrice,
            deliveryAddress
        });
      const placedOrder = await order.save();
      
      
      
      // 12. Generate payment link
      const paymentLink = await generatePaymentLink(
        {
          customer_name: req.body.customerName,
          customer_phone: '+916203015505',
          customer_email: 'arpitalocab@gmail.com',
        },
        totalPrice,
        order._id
      );
        return res.status(200).json({message:"Order Placed", order: placedOrder, paymentLink});
        } catch (error) {
        console.error("Placing order error: ",error);
        return res.status(500).json({message : "Failed to place order"});

    }
    
};

const trackOrder = async (req, res) => {
  try {
    const id = req.params.orderId;
    const order = await Order.findById(id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    return res
      .status(200)
      .json({ message: "Order Status: ", status: order.status, order });
  } catch (error) {
    console.error("Tracking order error: ", error);
    return res.status(500).json({ message: "Failed to track order" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const id = req.params.orderId;
    const { newStatus } = req.body;

    const updated = await Order.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );
    const validStatuses = [
      "pending",
      "confirmed",
      "dispatched",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (!updated) return res.status(404).json({ message: "Order not found" });

    return res.json({ message: "Status updated", order: updated });
  } catch (error) {
    console.error("Updating order error:", error);
    return res.status(500).json({ message: "Failed to update order" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const id = req.params.orderId;

    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });

    return res
      .status(200)
      .json({ message: "Order Cancelled", orderId: deleted._id });
  } catch (error) {
    console.error("Cancel order error: ", error);
    return res.status(500).json({ message: "Failed to cancel order" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user });
    res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user Orders." });
  }
};
module.exports = {
  placeOrder,
  trackOrder,
  updateOrderStatus,
  cancelOrder,
  getUserOrders,
};
