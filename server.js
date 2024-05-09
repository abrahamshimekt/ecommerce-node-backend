const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const cors = require("cors");
require("./utils/db");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/order");
const paymentRoutes = require("./routes/stripe");

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.use("/api/users", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/checkout", paymentRoutes);

app.get("/", (req, res) => {
  res.send("RESTFULL APIs FOR SHOP");
});

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
