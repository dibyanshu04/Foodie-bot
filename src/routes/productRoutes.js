const express = require('express')
const router = express.Router();
const {
  viewProducts,
  addProduct,
} = require("../controllers/productsControllers");

router.get("/view", viewProducts);
router.post('/add', addProduct)

module.exports = router