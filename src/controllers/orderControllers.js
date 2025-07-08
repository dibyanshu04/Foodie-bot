const Order = require('../models/order');
const order = require('../models/order');

const placeOrder = async (req, res) => {
    try {
        const customerName = req.body.customerName;
        const item = req.body.item;
        const deliveryAddress = req.body.deliveryAddress;

        if(!customerName || !item || !deliveryAddress ){
            return res.status(404).json({message: " customerName, item, deliveryAddress cannot be undefined!"})
        };
        const totalPrice = itemsreduce((sum,item) => sum + (item.price * item.quantity),0);
        const order = new Order({
            customerName,
            item,
            totalPrice,
            deliveryAddress
        });
        const placedOrder = await order.save();
        return res.status(200).json({message:"Order Placed", order: placedOrder});
        } catch (error) {
        console.error("Placing order error: ",error);
        return res.status(500).json({message : "Failed to place order"});
    }
};


const trackOrder = async (req, res) => {
    try {
        const id = req.params.orderId;
        const order = await Order.findById(id);

        if(!order) return res.status(404).json({message:"Order not found"});

        return res.status(200).json({message:"Order Status: ", status: order.status, order});
    } catch (error) {
        console.error("Tracking order error: ",error);
        return res.status(500).json({message : "Failed to track order"});
    }
};


const updateOrderStatus = async (req, res) => {
    try {
        const id = req.params.orderId;
        const {newStatus} = req.body;

        const updated = await Order.findByIdAndUpdate(
            id,
            {status: newStatus},
            {new: true}
        );
        if(!updated) return res.status(404).json({message: "Order not found"});

        return res.json({message: "Status updated", order: updated});

    } catch (error) {
        console.error("Updating order error:",error);
        return res.status(500).json({message : "Failed to update order"});
    }
}; 


const cancelOrder = async (req, res) => {
    try {
        const id = req.params.orderId;

        const deleted = await Order.findByIdAndDelete(id);
        if(!deleted) return res.status(404).json({message:"Order not found"});

        return res.status(200).josn({message: "Order Cancelled", orderId: deleted._id});
    } catch (error) {
        console.error("Cancel order error: ",error);
        return res.status(500).json({message : "Failed to cancel order"});
    }
};



module.exports = {
placeOrder, 
trackOrder,
updateOrderStatus, 
cancelOrder};

