const mongoose = require("mongoose");
const db = mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => console.log("connected to db"))
  .catch((error) => console.log(error));
module.exports = db;
