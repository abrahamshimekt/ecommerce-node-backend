const authRouter = require("express").Router();
const User = require("../models/user");
const CryptoJS = require("crypto-js");
const Jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

authRouter.post("/register", async (req, res) => {
  const newUser = new User({
    userName: req.body.userName,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASSWORD_SECRET
    ).toString(),
  });
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const savedUser = await newUser.save();
    session.commitTransaction();
    session.endSession();

    const userWithoutPassword = savedUser.toObject();
    delete userWithoutPassword.password;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ userName: req.body.userName });
    !user && res.status(401).json("Wrong user credentials");
    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASSWORD_SECRET
    );
    const origianlPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    origianlPassword !== req.body.password &&
      res.status(401).json("Wrong user credentials");
    const accessToken = Jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.SECRET_KEY,
      { expiresIn: "3d" }
    );

    const { password, ...others } = user._doc;
    res.status(200).json({ others, accessToken });
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

module.exports = authRouter;
