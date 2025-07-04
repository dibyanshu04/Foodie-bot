const { default: mongoose } = require("mongoose");
const Product = require('../models/products')
const addProduct = async (req, res) => {
    try {
        const productName = req.body.productName;
        const productCategory = req.body.productCategory;
        const price = req.body.price;
        const foodType = req.body.foodType;

        if (!productName || !productCategory || !price) {
          return res
            .status(403)
            .json({
              message:
                "productName, productCategory, price cannot be undefined!",
            });
        }

        const newProduct = new Product({
          productName,
          productCategory,
          price,
          foodType,
        });

        await newProduct.save();

        if (!newProduct) {
          return res.send("Product Not Added!");
        }

        return res.status(201).json({ message: "Product successfully Added!" });
    } catch (error) {
        return res.status(500).json({message:'Internal Server Error!', error})
    }
}

const updateProduct = async (req, res) => {
    
}

const viewProducts = async (req, res) => {};

const viewProductById = async (req, res) => {};

const deleteProduct = async (req, res) => {
    
}
module.exports = {
    addProduct,
    updateProduct,
    viewProducts,
    viewProductById,
    deleteProduct
}