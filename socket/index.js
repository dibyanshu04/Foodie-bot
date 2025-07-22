const Restaurant = require('../src/models/restaurant');
const Order = require('../src/models/order');
const Reservation = require('../src/models/reservation');
const jwt = require('jsonwebtoken')
const initializeSocket = (io) => {
    io.use((socket , next) => {
        try {
          const authHeader =
            socket.handshake.headers.authorization ||
            socket.handshake.auth?.token;
            
          if (!authHeader)
            throw new Error("Authorization token missing");
          
          const token = authHeader;

          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (!decoded?.user._id)
            throw new Error("Invalid or expired token");
          socket.userId = decoded.user._id;
          next();
        } catch (err) {
          next(err);
        }
    });
    io.on("connection", (socket, next) => {
        try {
            socket.emit('welcome-message', { message: 'Hi, I am a Foodie bot! Start Searching for Restaurants or Food or Cuisines' })
            
            socket.on("start-chat", async (data) => {
                const query = data.message
                console.log(query)
                // Tasks with this query
                // 1. fetch restaurant cuisine , location from the query using NLM
                // 2. create filter based on the data from NLM
                // 3. find restaurant based on the filters
                // 4. emit event with restaurants found
                
                const restaurants = await Restaurant.find({}).populate("menu")
                
                socket.emit("restaurants-found", restaurants)
            })
        } catch (err) {
            next(err)
        }
    })
//   socket.on("search_restaurants", async ({ cuisine, location }) => {
//     try {
//       const results = await Restaurant.find({
//         cuisine: { $regex: cuisine, $options: "i" },
//         location: { $regex: location, $options: "i" },
//       });
//       socket.emit("search_results", results);
//     } catch (err) {
//       console.error(err);
//       socket.emit("error", "Failed to fetch restaurants");
//     }
//   });

//   socket.on("place_order", async (orderData) => {
//     try {
//       const { customerName, items, deliveryAddress } = orderData;

//       const totalPrice = items.reduce(
//         (acc, items) => acc + items.price * items.quantity,
//         0
//       );

//       newOrder = newOrder({
//         customerName,
//         items,
//         totalPrice,
//         deliveryAddress,
//       });

//       const savedOrder = await newOrder.save();

//       socket.emit("order_placed", {
//         message: "Order Placed Successfully!",
//         orderId: savedOrder._id,
//         status: savedOrder.status,
//       });
//     } catch (error) {
//       console.error("Order Error:", error);
//       socket.emit("error", "Failed to place Order.");
//     }
//   });

//   socket.on("book_reservation", async (data) => {
//     try {
//       const newReservation = new Reservation({
//         customerName,
//         restaurantName,
//         date,
//         time,
//         guests,
//         specialRequest,
//       });
//       const saved = await newReservation.save();

//       socket.emit("reservation_confirmed", {
//         message: "Resevation Confirmed!",
//         reservationId: saved._id,
//         date: saved.date,
//         time: saved.time,
//       });
//     } catch (error) {
//       console.error("Resrvation error:", error);
//       socket.emit("error", "Failed to book reservation");
//     }
//   });

//   socket.on("track_order", async ({ orderId }) => {
//     try {
//       const order = await Order.findById(orderId);

//       if (!order) {
//         socket.emit("order_not_found", { message: "Order not found" });
//         return;
//       }
//       socket.emit("order_status", {
//         orderId: order._id,
//         status: order_status,
//         message: `Your order is current ${order.status}`,
//       });
//     } catch (error) {
//       console.error("Track order error", error);
//       socket.emit("error", "Failed to track order");
//     }
//   });

//   socket.on("update_order_status", async ({ orderId, newStatus }) => {
//     try {
//       const updated = await Order.findByIdAndUpdate(
//         orderId,
//         { status: newStatus },
//         { new: true }
//       );
//       socket.emit("order_status_updated", {
//         orderId: updated._id,
//         status: updated.status,
//         message: `Status updated to: ${updated.status}`,
//       });
//     } catch (error) {
//       console.error("update order status error", error);
//       socket.emit("error", "Faile to Update status");
//     }
//   });
}; 


    
    


module.exports = {
  initializeSocket,
};