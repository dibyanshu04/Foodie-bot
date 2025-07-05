const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    productCategory: {
        type: String,
        required: false,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
   foodType: {   //  later used in filters
      type: String,
      enum: ['veg', 'non-veg']
    },
    restaurantId: {   // later to be discuss
        type: mongoose.Schema.Types.ObjectId,
        required: false
   }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;