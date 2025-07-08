const express = require('express')
const router = express.Router();
const {
  viewProducts,
  addProductToRestaurant,
  updateProduct,
  viewProductById,
  deleteProduct,
  searchProduct,
} = require("../controllers/productsControllers");

router.get("/view", viewProducts); 
router.get("search-product", searchProduct)
router.get("/view/:productId", viewProductById);
router.post("/add/:restaurantId", addProductToRestaurant);
router.put("/update/:productId", updateProduct);
router.delete('/delete/:productId', deleteProduct);

module.exports = router