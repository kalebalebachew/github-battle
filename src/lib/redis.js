import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

export const getCache = async (key) => {
  if (process.env.REDIS_ENABLED !== 'true') return null;
  return redis.get(key);
};

export const setCache = async (key, value, expiration = 3600) => {
  if (process.env.REDIS_ENABLED !== 'true') return;
  await redis.set(key, value, { ex: expiration });
};