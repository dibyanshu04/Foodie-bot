const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    customerName : {
        type: String ,
        required: true
    },
    items: {
        type: String,
        quantity: Number,
        price: Number
    },
    totalPrice:{
        type: Number,
        required: true
    },
    deliveryAddress:{
        type: String,
        required: true
    },
    status:{
        type: String ,
        default: "pending"
    },
    createdAt:{
        type: Date ,
        required:Date.now
    }

});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;