const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    customerName : {
        type: [mongoose.Schema.Types.ObjectId] ,
        required: true,
        ref: 'User'

    },
    item: {
        type: String,
        quantity: Number,
        price: Number
    },
    totalPrice:{
        type: Number,
        required: true
    },
    deliveryAddress:{
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
        ref: 'User'
    },
    status:{
        type: String ,
        default: "pending"
    },
},
{timestamps: true});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;