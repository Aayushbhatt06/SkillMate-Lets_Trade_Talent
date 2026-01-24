const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
    console.log("redis Connected");
  }
};

module.exports = { client, connectRedis };
