import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL
});

client.on('error', (err) => console.log('Redis Client Error', err));

await client.connect();

export const setCache = async (key, value, expiration = 3600) => {
  await client.set(key, value, {
    EX: expiration
  });
};

export const getCache = async (key) => {
  const value = await client.get(key);
  return value;
};

export default client;