const mongoose = require("mongoose");
require("dotenv").config();
const url = `mongodb+srv://olapelu:olapelu@cluster0.lydrn3n.mongodb.net/?retryWrites=true&w=majority`;
// const url = process.env.DB_URL;

const connect = async () => {
  try {
    console.log("Try to database connected");
    await mongoose.connect(url);
    console.log("database connected");
  } catch (error) {
    console.log("error " + error);
  }
};

module.exports = connect;
