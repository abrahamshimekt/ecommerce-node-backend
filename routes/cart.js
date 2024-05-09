const cartRouter = require('express').Router();
const Cart = require('../models/cart');
const { verifyToken, verifyTokenAndAuth, verifyTokenAndAdmin } = require("../middleware/verifyToken");
const { default: mongoose } = require('mongoose');


cartRouter.post('/',verifyToken,async(req,res)=>{
    const newCart = new Cart(req.body);
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const savedCart = await newCart.save();
        session.commitTransaction();
        session.endSession();
        res.status(201).json(savedCart);
        
    } catch (error) {

        session.abortTransaction();
        session.endSession()
        res.status(500).json(error);
        
    }
});

cartRouter.put('/:id',verifyTokenAndAuth,async(req,res)=>{
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const updatedCart = await Cart.findByIdAndUpdate(req.params.id,{
            $set:req.body
        },{new:true},{remove:false});
        session.commitTransaction();
        session.endSession();
        res.status(200).json(updatedCart);
    } catch (error) {
        session.abortTransaction();
        session.endSession();
        res.status(500).json(error);
        
    }
});

cartRouter.delete('/:id',verifyTokenAndAuth, async (req, res)=>{
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const cart = await Cart.findByIdAndDelete(req.params.id);
        session.commitTransaction();
        session.endSession();
        res.status(200).json("Cart Is Empty");
        
    } catch (error) {
        res.status(500).json(error);
        
    }
});

cartRouter.get("/find/:userId",verifyTokenAndAuth,async(req,res)=>{
    try {
        const cart = await Cart.findOne({userId:req.params.userId});
        res.status(200).json(cart);
        
    } catch (error) {

        res.status(500).json(error);

    }
})

cartRouter.get("/" , verifyTokenAndAdmin, async (req, res)=>{
    try {
        const carts = await Cart.find();
        res.status(200).json(carts);
    } catch (error) {
        res.status(500).json(error);
    }
});


module.exports = cartRouter;