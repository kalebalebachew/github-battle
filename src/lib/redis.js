import Redis from "ioredis";

const REDIS_PORT = 6379;
const client = new Redis(REDIS_PORT);

client.on("error", (err) => {
  console.log("Error " + err);
});

export const setCache = async (key, value, expiration = 3000) => {
  await client.setex(key, expiration, value);
};

export const getCache = async (key) => {
  const data = await client.get(key);
  return data;
};