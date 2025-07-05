const express = require('express');
const cors = require('cors');
const productRoutes = require('./src/routes/productRoutes')
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello from Restaurant Bot Backend");
}); 

app.use('/product', productRoutes)  //it is a middleware
// app.use('/restaurants', restaurantRoutes)

module.exports = app;