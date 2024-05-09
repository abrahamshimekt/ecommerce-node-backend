const mongoose = require("mongoose");
const { verifyTokenAndAdmin } = require("../middleware/verifyToken");
const productRouter = require("express").Router();
const Product = require("../models/product");

productRouter.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newProduct = new Product(req.body);
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const savedProduct = await newProduct.save();
    session.commitTransaction();
    session.endSession();
    res.status(200).json(savedProduct);
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    res.status(500).json(error);
  }
});

productRouter.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
      { removed: false }
    );
    session.commitTransaction();
    session.endSession();
    res.status(200).json(updateProduct);
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    res.status(500).json(error);
  }
});

productRouter.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Product.findByIdAndDelete(req.params.id);
    session.commitTransaction();
    session.endSession();
    res.status(200).json("Product Deleted Success");
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    res.status(500).json(error);
  }
});

productRouter.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    !product && res.status(404).json("product not found");
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json(error);
  }
});

productRouter.get("/", async (req, res) => {
  const queryNew = req.params.new;
  const queryCategory = req.params.category;
  try {
    let products;
    if (queryNew) {
      products = await Product.find().sort({ created: -1 }).limit(5);
    } else if (queryCategory) {
      products = await Product.find({
        categories: {
          $in: [queryCategory],
        },
      });
    } else {
      products = await Product.find();
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = productRouter;
