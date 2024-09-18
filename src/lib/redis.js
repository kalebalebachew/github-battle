import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
})

export const setCache = async (key, value, expiration = 3600) => {
  try {
    await redis.set(key, value, { ex: expiration });
    console.log(`Successfully set cache for key: ${key}`);
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
    throw error;
  }
};

export const getCache = async (key) => {
  try {
    const value = await redis.get(key);
    console.log(`Retrieved cache for key: ${key}`, value);
    return value;
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error);
    throw error;
  }
};

export default redis;