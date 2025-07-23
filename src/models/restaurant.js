const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  restaurantName: {
    type: String,
    required: true,
  },
  cuisine: [
    {
      type: String,
      required: true,
    },
  ],
  location: {
    type: String,
    required: true,
  },
  priceRange: {
    type: String,
    required: true,
  },
  menu: {
    type: [mongoose.Schema.Types.ObjectId], // yeh mai baad me bata hu
    ref: "Product",
  },
  imageUrl: String,
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
