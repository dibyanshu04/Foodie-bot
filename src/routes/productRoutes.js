const express = require("express");
const router = express.Router();
const {
  viewProducts,
  addProductToRestaurant,
  updateProduct,
  viewProductById,
  deleteProduct,
  searchProduct,
} = require("../controllers/productsControllers");

router.get("/", viewProducts);
router.get("/search-product", searchProduct);
router.get("/:productId", viewProductById);
router.post("/:restaurantId", addProductToRestaurant);
router.put("/:productId", updateProduct);
router.delete("/:productId", deleteProduct);

module.exports = router;
