const express = require('express')
const router = express.Router();
const {
  viewProducts,
  addProduct,
  updateProduct,
  viewProductById,
  deleteProduct
} = require("../controllers/productsControllers");

router.get("/view", viewProducts);
router.post('/add', addProduct);
router.put('/update/:id',updateProduct);
router.get("/viewById/:id", viewProductById);
router.delete('/delete/:id', deleteProduct);

module.exports = router