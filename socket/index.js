const Restaurant = require('../src/models/restaurant');


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
}; 
   /* socket.on('search_restaurants', (data) => {
        console.log("Searching restaurants for: ", data);

    //DUMMY DATA LATER COME FROM MONGODB
    const fakeResults = [
        {name:'Pizza Palace', cuisine:'Italian', location :'Delhi'},
        {name:'Sushi', cuisine:'Japanese', location :'Delhi'},
    ];

    socket.emit("search_results",fakeResults);*/

