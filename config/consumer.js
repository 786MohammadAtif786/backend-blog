import { getChannel } from "./rabbit.js";
import { io } from "../app.js"; // 👈 socket import

export const startConsumer = async () => {
  const channel = getChannel();

  if (!channel) {
    console.log("❌ Channel not ready");
    return;
  }

  channel.consume("blogQueue", (msg) => {
    if (!msg) return;

    const data = JSON.parse(msg.content.toString());

    console.log("📩 New blog received:", data);

    // 🔔 Admin ko live notification
    io.to("adminRoom").emit("newBlog", {
      message: "New blog submitted 📝",
      blogId: data.blogId
    });

    channel.ack(msg);
  });

  console.log("👂 Consumer listening to blogQueue...");
};