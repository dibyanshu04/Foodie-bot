const express = require('express');
const cors = require('cors');
const productRoutes = require('./src/routes/productRoutes')
const restaurantRoutes = require('./src/routes/restaurantRoutes')
const reservationRoutes = require('./src/routes/reservationRoutes')
const userRoutes = require('./src/routes/userRoutes');
const orderRoutes = require('./src/routes/orderRoutes');


const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello from Restaurant Bot Backend");
}); 

app.use('/product', productRoutes)  //it is a middleware
app.use('/restaurant', restaurantRoutes)
app.use('/reservation', reservationRoutes)
app.use('/user', userRoutes);
app.use('/order', orderRoutes);


module.exports = app;