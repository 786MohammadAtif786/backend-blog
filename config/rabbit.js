// config/rabbit.js

import amqp from "amqplib";

let channel;

export const connectRabbitMQ = async () => {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertQueue("blogQueue");

    console.log("✅ RabbitMQ Connected");
};

export const getChannel = () => channel;