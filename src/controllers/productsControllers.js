const { default: mongoose } = require("mongoose");
const Product = require("../models/products");
const addProduct = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(404).json({ message: "Body is not defined." });
    }
    const productName = req.body.productName;
    const productCategory = req.body.productCategory;
    const price = req.body.price;
    const foodType = req.body.foodType;

    if (!productName || !productCategory || !price) {
      return res.status(404).json({
        message: "productName, productCategory, price cannot be undefined!",
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

    return res
      .status(201)
      .json({ message: "Product successfully Added!", newProduct });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error!", error });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.productId;
    const { productName, productCategory, price } = req.body;
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id },
      { productName, productCategory, price },
      {new: true}

    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to Update Product", error });
  }
};

const viewProducts = async (req, res) => {
  try {
    const allProducts = await Product.find({}); // return an array of documents, {} -> this is the options.
    if (allProducts) {
      console.log(allProducts);
    } else {
      console.log("No Products on list");
    }

    return res.status(200).json({
      message: "Products viewed successfully!",
      Products: allProducts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to view Product", error });
  }
};

const viewProductById = async (req, res) => {
  try {
    const id = req.params.productId;
    console.log(id);
    const product = await Product.findById(id); // this return a single document. It accepts the document Id as a parameter
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found associated with the Id" });
    }

    return res.status(200).json({
      message: "Products viewed by id successfully!",
      Product: product,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Failed to view product by id", error });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.productId;
    const productToDelete = await Product.findByIdAndDelete(id);
    const toDeleteProduct = await Product.findOneAndDelete({ _id: id });

    if (!toDeleteProduct) {
      return res
        .status(404)
        .json({ message: "No Prdouct found to be deleted!" });
    }
    return res
      .status(200)
      .json({ message: "Product deleted successfully!", toDeleteProduct });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to delete product", error });
  }
};

const searchProduct = async (req, res) => {
  const productName = req.body.productName;

  const product = await Product.findOne({ productName });
  if (!product) {
    return res.status(404).json({ message: " No product with provided name!" });
  }

  return res
    .status(200)
    .json({ message: "Product found successfully!", product });
};

module.exports = {
  addProduct,
  updateProduct,
  viewProducts,
  viewProductById,
  deleteProduct,
  searchProduct,
};
