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
app.set("trust proxy", 1);

app.use(cors({
  origin: function (origin, callback) {

    const allowedOrigins = [
      "http://localhost:5173",
      "https://frontend-blog-alpha-ten.vercel.app",
      "https://devnotes.sbs",
      "https://www.devnotes.sbs"
    ];

    // 🔥 allow no origin (mobile, postman, incognito)
    if (!origin) return callback(null, true);

    // 🔥 normalize origin (remove trailing slash)
    const cleanOrigin = origin.replace(/\/$/, "");

    if (allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      console.log("Blocked origin:", origin); // 🔍 debug
      callback(null, false); // ❗ don't throw error
    }
  },
  credentials: true
}));

// middleware
app.use(cookieParser());
app.use(express.json());


app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
}));


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