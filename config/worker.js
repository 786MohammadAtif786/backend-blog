import amqp from "amqplib";
import sharp from "sharp";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import Blog from "./models/blog.js"; // path adjust karo

// ✅ Mongo connect (important for worker)
await mongoose.connect(process.env.MONGO_URI);

// 📧 Email config
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const startWorker = async () => {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue("blogQueue");

    console.log("🐇 Worker started...");

    channel.consume("blogQueue", async (msg) => {
        try {
            const data = JSON.parse(msg.content.toString());
            console.log("Processing blog:", data.blogId);

            // 🔎 Blog fetch karo
            const blog = await Blog.findById(data.blogId);

            if (!blog) {
                console.log("Blog not found");
                return channel.ack(msg);
            }

            // =========================
            // 🖼️ 1. IMAGE COMPRESS
            // =========================
            if (blog.image) {
                const outputPath = `compressed-${Date.now()}.jpg`;

                await sharp(blog.image)
                    .resize(800)
                    .jpeg({ quality: 70 })
                    .toFile(outputPath);

                blog.image = outputPath;
                console.log("✅ Image compressed");
            }

            // =========================
            // 🔔 2. ADMIN NOTIFY (DB)
            // =========================
            blog.status = "pending"; // ya "review"
            await blog.save();

            console.log("✅ Blog marked for review");

            // =========================
            // 📧 3. EMAIL SEND
            // =========================
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: "admin@gmail.com", // change karo
                subject: "New Blog Pending Approval",
                text: `Blog "${blog.title}" needs approval`
            });

            console.log("✅ Email sent");

            // ✅ done
            channel.ack(msg);

        } catch (err) {
            console.error("❌ Worker error:", err);

            // ❗ message lose mat karo
            channel.nack(msg, false, true); // retry
        }
    });
};

startWorker();