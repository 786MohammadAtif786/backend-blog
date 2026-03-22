import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import {createClient} from "redis"

import connectDB from "./config/db.js";
import "./config/cloudinary.js";
import authRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import commentRoutes from "./routes/commentRoutes.js"

const app = express();


// database connect
connectDB();
const redisUrl = process.env.REDIS_URL;

if(!redisUrl) {
    console.log('Missing redis url');
    process.exit(1);
}

export const redisCilent = createClient({
    url: redisUrl
});

redisCilent.connect().then(() => {
    console.log("connected to redis");
}).catch((err) => {
    console.log(err);
    
})
// middleware
app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(helmet());


// routes
app.use("/api/v1", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);


// test route
app.get("/", (req,res)=>{
  res.send("Blog API running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`);
});