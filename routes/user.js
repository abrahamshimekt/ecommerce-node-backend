const mongoose = require("mongoose");
const CryptoJS = require("crypto-js");

const User = require("../models/user");
const {
  verifyTokenAndAuth,
  verifyTokenAndAdmin,
} = require("../middleware/verifyToken");
const userRouter = require("express").Router();

userRouter.put("/:id", verifyTokenAndAuth, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASSWORD_SECRET
    ).toString();
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
      { removed: false }
    );
    const updateUserWithoutPassword = updateUser.toObject();
    delete updateUserWithoutPassword.password;
    session.commitTransaction();
    session.endSession();
    res.status(200).json(updateUserWithoutPassword);
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    res.status(400).json("bad request");
  }
});

userRouter.delete("/:id", verifyTokenAndAuth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await User.findByIdAndDelete(req.params.id);
    session.commitTransaction();
    session.endSession();
    res.status(200).json("user deleted success");
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    res.status(400).json("bad request");
  }
});

userRouter.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json(error);
  }
});

userRouter.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ id: -1 }).limit(5)
      : await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

userRouter.get("/stats", async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      { $project: { month: { $month: $createdAt } } },
      { $group: { _id: "$month", total: { $sum: 1 } } },
    ]);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = userRouter;
