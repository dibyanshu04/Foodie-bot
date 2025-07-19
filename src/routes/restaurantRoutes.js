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

router.get("/", viewRestaurant);
router.get("/:restaurantId", viewRestaurantById);
router.post("/", addRestaurant);
router.put("/:restaurantId", updateRestaurant);
router.delete("/:restaurantId", deleteRestaurant);

module.exports = router;
