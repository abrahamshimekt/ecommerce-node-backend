const { default: mongoose } = require("mongoose");
const {
  verifyToken,
  verifyTokenAndAuth,
  verifyTokenAndAdmin,
} = require("../middleware/verifyToken");

const orderRouter = require("express").Router();
const Order = require("../models/order");

orderRouter.post("/", verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const savedOrder = await newOrder.save();
    session.commitTransaction();
    session.endSession();

    res.status(200).json(savedOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

orderRouter.put('/:id',verifyTokenAndAdmin,async(req,res)=>{
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const updateOrder = await Order.findByIdAndUpdate(req.params.id,{$set:req.body},{new:true},{removed:false});
        session.commitTransaction();
        session.endSession();
        res.status(200).json(updateOrder);

        
    } catch (error) {
        session.abortTransaction();
        session.endSession();
        res.status(500).json(error);
        
    }
});

orderRouter.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await Order.findByIdAndDelete(req.params.id)
        session.commitTransaction();
        session.endSession();
        res.status(200).json("Order Has Been Cancelled");
    } catch (error) {
        session.abortTransaction();
        session.endSession();
        res.status(500).json(error);
    }
});

orderRouter.get("/find/:userId", verifyTokenAndAuth, async (req, res) => {
    try {
        const cart = await Order.find({
            userId: req.params.userId
        });
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json(error);
    }
});

orderRouter.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json(error);
    }

});

orderRouter.get("/stats", verifyTokenAndAdmin, async (req, res) => {

    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const PreviousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

    try {
        const income = await Order.aggregate([{
            $match: {
                createdAt: {
                    $gte: PreviousMonth
                }
            }
        },
        {
            $project: {
                month: { $month: "$createdAt" },
                sales: "$amount"
            },
        },
        {
            $group: {
                _id: "$month",
                total: { $sales: "$sales" }
            }
        }

        ])
        res.status(200).json(income);
    } catch (error) {
        res.status(500).json(error);
    }
});


module.exports = orderRouter;
