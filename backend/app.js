import express from "express";
import dotenv from "dotenv";
dotenv.config();
import {createServer} from "http";
import mongoose from "mongoose";
import cors from "cors";
import connectToServer from "./controllers/socketManeger.js";
import userRouter from "./routers/userRouter.js";

const app = express();
const server=createServer(app);
const io = connectToServer(server);

app.set("PORT", (process.env.PORT || 8000));
app.use(cors({ origin: "https://lumitalk-vc-frontend.onrender.com" , credentials: true })); 



app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit: "40kb", extended: true}));

const MONGO_URI=process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("DB Connected"))
  .catch((err) => console.error("DB Connection Error:", err));

 
 
app.use("/api/user",userRouter);


app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ error: err.message });
});





server.listen(app.get("PORT"),()=>{
    console.log(`Server is running on port ${app.get("PORT") }`);
})

