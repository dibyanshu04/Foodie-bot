const Restaurant = require('../src/models/restaurant');
const Order = require('../src/models/order');
const Reservation = require('../src/models/reservation');

module.exports = (io,socket) => {

    socket.on('search_restaurants', async({cuisine,location})=>{
        try{
            const results = await Restaurant.find({
                cuisine:{ $regex: cuisine, $options: 'i'},
                location:{ $regex: location, $options: 'i' }
            });
        socket.emit('search_results', results);
        } catch (err){
            console.error(err);
            socket.emit('error','Failed to fetch restaurants');
        }
    });

    socket.on('place_order',async(orderData)=> {
        try{
           const{customerName, items, deliveryAddress}=orderData;

           const totalPrice = items.reduce((acc,item)=> acc +(item.price * item.quantity),0);

           newOrder = newOrder({
            customerName,
            items,
            totalPrice,
            deliveryAddress
           });

           const savedOrder = await newOrder.save();

           socket.emit('order_placed',{
            message : "Order Placed Successfully!",
            orderId : savedOrder._id,
            status: savedOrder.status
           });
        } catch(error){

            console.error("Order Error:",error);
            socket.emit('error', 'Failed to place Order.');
        }
    });

    socket.on('book_reservation',async(data)=>{
        try{
            const newReservation = new Reservation({
                customerName,
                restaurantName,
                date,
                time,
                guests,
                specialRequest
            });
            const saved = await newReservation.save();

            socket.emit('reservation_confirmed',{
                message:"Resevation Confirmed!",
                reservationId:saved._id,
                date: saved.date,
                time: saved.time
            });
        }catch(error){
            console.error("Resrvation error:", error);
            socket.emit('error',"Failed to book reservation");
        }
     });

     socket.on('track_order', async({orderId})=>{
        try{
            const order = await Order.findById(orderId);

            if(!order){
                socket.emit('order_not_found',{message:"Order not found"});
                return;
            }
            socket.emit('order_status',{
                orderId: order._id,
                status: order_status,
                message: `Your order is current ${order.status}`});

        } catch(error){
            console.error('Track order error',error);
            socket.emit('error','Failed to track order');
        }
        
     });

     socket.on('update_order_status',async({orderId, newStatus})=>{
        try{
            const updated = await Order.findByIdAndUpdate(
                orderId,
                {status: newStatus},
                {new: true}
            );
            socket.emit('order_status_updated',{
                orderId:updated._id,
                status: updated.status,
                message: `Status updated to: ${updated.status}`
            });
        }catch(error){
            console.error("update order status error",error);
            socket.emit('error', "Faile to Update status");
        }
     });
}; 


    
    

