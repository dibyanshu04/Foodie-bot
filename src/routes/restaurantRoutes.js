const express = require("express");
const router = express.Router();

const {
  addRestaurant,
  addProductToMenu,
  viewRestaurant,
  viewRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantControllers");

router.get("/view", viewRestaurant);
router.get("/viewById/:restaurantId", viewRestaurantById);
router.post("/add", addRestaurant);
router.post("/add/:menuId", addProductToMenu);
router.put("/update/:restaurantId", updateRestaurant);

router.delete("/delete/:restaurantId", deleteRestaurant);

module.exports = router;
