// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";
// import {createClient} from "redis"

// import connectDB from "./config/db.js";
// import "./config/cloudinary.js";
// import authRoutes from "./routes/userRoutes.js";
// import blogRoutes from "./routes/blogRoutes.js";
// import commentRoutes from "./routes/commentRoutes.js"

// const app = express();


// // database connect
// // server.js

// import { connectRabbitMQ } from "./config/rabbit.js";

// connectRabbitMQ();
// connectDB();
// const redisUrl = process.env.REDIS_URL;

// if(!redisUrl) {
//     console.log('Missing redis url');
//     process.exit(1);
// }

// export const redisCilent = createClient({
//     url: redisUrl
// });

// redisCilent.connect().then(() => {
//     console.log("connected to redis");
// }).catch((err) => {
//     console.log(err);
    
// })
// app.set("trust proxy", 1);


// // app.use(cors({
// //   origin: [
// //     "https://www.devnotes.sbs",
// //     "http://localhost:5173"
// //   ],
// //   credentials: true
// // }));

// app.use(cors({
//   origin: function (origin, callback) {

//     const allowedOrigins = [
//       "http://localhost:5173",
//       "https://frontend-blog-alpha-ten.vercel.app",
//       "https://devnotes.sbs",
//       "https://www.devnotes.sbs"
//     ];

//     // 🔥 allow no origin (mobile, postman, incognito)
//     if (!origin) return callback(null, true);

//     // 🔥 normalize origin (remove trailing slash)
//     const cleanOrigin = origin.replace(/\/$/, "");

//     if (allowedOrigins.includes(cleanOrigin)) {
//       callback(null, true);
//     } else {
//       console.log("Blocked origin:", origin); // 🔍 debug
//       callback(null, false); // ❗ don't throw error
//     }
//   },
//   credentials: true
// }));

// // middleware
// app.use(cookieParser());
// app.use(express.json());


// app.use(helmet({
//   crossOriginResourcePolicy: false,
//   crossOriginOpenerPolicy: false
// }));


// // routes
// app.use("/api/v1", authRoutes);
// app.use("/api/blogs", blogRoutes);
// app.use("/api/comments", commentRoutes);


// // test route
// app.get("/", (req,res)=>{
//   res.send("Blog API running");
// });

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, ()=>{
//   console.log(`Server running on port ${PORT}`);
// });




import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "redis";

// 🔌 DB & Services
import connectDB from "./config/db.js";
import "./config/cloudinary.js";
import { connectRabbitMQ } from "./config/rabbit.js";
import { startConsumer } from "./config/consumer.js";

// 📦 Routes
import authRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

// 🚀 Init app
const app = express();
const server = http.createServer(app);

// ==========================
// 🔥 SOCKET.IO SETUP
// ==========================
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://frontend-blog-alpha-ten.vercel.app",
      "https://devnotes.sbs",
      "https://www.devnotes.sbs"
    ],
    credentials: true
  }
});

export { io };

// 🧠 Socket connection
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // 👑 Admin join room
  socket.on("joinAdmin", () => {
    socket.join("adminRoom");
    console.log("👑 Admin joined room");
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// ==========================
// 🔥 CONNECT SERVICES
// ==========================
connectDB();
// startConsumer()
// connectRabbitMQ();

// ==========================
// 🔥 REDIS SETUP
// ==========================
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.log("❌ Missing Redis URL");
  process.exit(1);
}

export const redisCilent = createClient({
  url: redisUrl
});

redisCilent.connect()
  .then(() => console.log("✅ Connected to Redis"))
  .catch((err) => console.log("❌ Redis Error:", err));

// ==========================
// 🔥 MIDDLEWARE
// ==========================
app.set("trust proxy", 1);

app.use(cors({
  origin: function (origin, callback) {

    const allowedOrigins = [
      "http://localhost:5173",
      "https://frontend-blog-alpha-ten.vercel.app",
      "https://devnotes.sbs",
      "https://www.devnotes.sbs"
    ];

    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, "");

    if (allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked origin:", origin);
      callback(null, false);
    }
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
}));

// ==========================
// 🔥 ROUTES
// ==========================
app.use("/api/v1", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);

// ==========================
// 🔥 TEST ROUTE
// ==========================
app.get("/", (req, res) => {
  res.send("🚀 Blog API running with Socket.IO");
});

// ==========================
// 🔥 START SERVER
// ==========================
const PORT = process.env.PORT || 3000;

// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


const startServer = async () => {
  try {
    await connectRabbitMQ();   // ⏳ wait karega
    startConsumer();           // ✅ ab channel ready hoga

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.log("❌ Server start error:", err);
  }
};

startServer();