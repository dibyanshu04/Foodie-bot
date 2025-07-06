const {default: mongoose} = require('mongoose');
const Restaurant = require('../models/restaurant');

// create restuarants, view all restaurant , view by id, add products to menu.
const addRestaurant = async(req,res) => {
    try {
        const restaurantName = req.body.restaurantName;
        const cuisine = req.body.cuisine;
        const location = req.body.location;
        const priceRange = req.body.priceRange;
        const menu = req.body.menu;

        if(!restaurantName || !cuisine || !location || !priceRange){
            return res.status(404).json({
        message: "restaurantName, cuisine, location, price range and menu cannot be undefined!",
      });
        }
        const newRestaurant = new Restaurant({
            restaurantName,
            cuisine,
            location,
            priceRange,
            menu
        })
        await newRestaurant.save()
        if(!newRestaurant){
            return res.status(404).json({message: "No new Restaurant "})
        }
        return res.status(200).json({message: "New Restaurent added successfully!", newRestaurant})
        

    }catch(error){
        console.log(error);
        return res.status(500).json({message: "Failed to add Restaurant "})

    }}


const viewRestaurant = async(req,res) =>{
    try {
        const allRestaurants = await Restaurant.find({});
        if(!allRestaurants){
            res.status(404).json({message: "No Restaurants Found"})
        }else(console.log(allRestaurants));
        return res.status(200).json({
      message: "Restaurants viewed successfully!",
      Restaurant: allRestaurants,
    });

    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Failed to view Restaurants!"})
    };
};




const viewRestaurantById = async(req,res) =>{
    try {
        const id = req.params.restaurantId;
        console.log(id);
        const restaurant = Restaurant.findById(id);
        if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found associated with the Id" });
    }

    return res.status(200).json({
      message: "Restaurant viewed by id successfully!",
      Restaurant: restaurant
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Failed to view restaurant by id", error });
  }
    
};





const updateRestaurant=async(req,res)=>{
     try {
    const id = req.params.restaurantId
    const { cuisine, priceRange, menu } = req.body
    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      { _id: id },
      { cuisine, priceRange, menu }
    );
    if (!updatedRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.status(200).json(updatedRestaurant);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to Update Restaurant", error });
  }
};


const deleteRestaurant = async(req,res)=>{
    try {
        const id = req.params.restaurantId;
        const restaurantToDelete = Restaurant.findByIdAndDelete(id);
        const toDeleteRestaurant = Restaurant.findOneAndDelete({_id:id});

         if (!toDeleteRestaurant) {
      return res
        .status(404)
        .json({ message: "No Restaurant found to be deleted!" });
    }
    return res
      .status(200)
      .json({ message: "Restaurant deleted successfully!", toDeleteRestaurant, restaurantToDelete });
    } catch (error) {
        console.log(error);
    return res.status(500).json({ message: "Failed to delete Restaurant", error });
    }
};
const addProductToMenu = async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
};

module.exports= {
        addRestaurant,
        addProductToMenu,
        viewRestaurant,
        viewRestaurantById,
        updateRestaurant,
        deleteRestaurant,
    };
