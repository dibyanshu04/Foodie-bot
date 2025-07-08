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
    description: {
        type:String
    },
    imageUrl: String,
    userRating: [{
        rating: {
            type: Number,
            min: 1,
            max:5
        },
        review: {
            type: String,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    }]
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;