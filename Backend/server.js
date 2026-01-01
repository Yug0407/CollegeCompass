const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/user",require("./routes/userRoutes"));

app.listen(5000, ()=> console.log("Backend running on PORT 5000"));
