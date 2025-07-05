const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },
    restaurantName:  {
        type: String,
        required: true
    },

    date:{
        type: String,
        required: true
    }
    time:{
        type: String,
        required: true
    },
    guests:{
        type:Number,
        required:true
    },
    specialRequest:{
        type: String,
        default:""
    },
    status:{
        type: String,
        default:Date.now
    }
});

const Reservation = mongoose.model('Reservation',reservationSchema);
module.exports = Reservation;