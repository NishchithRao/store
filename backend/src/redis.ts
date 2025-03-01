import { createClient } from "redis";

let client: ReturnType<typeof createClient>;

const initRedis = () => {
  client = createClient({
    url: process.env.REDIS_URL,
  });
  client.connect();
  return client;
};

const saveItemToRedis = async <P extends object>(key: string, value: P) => {
  await client.set(key, JSON.stringify(value), {
    EX: 60 * 60 * 24 * 7,
  });
  return client;
};

const getRedisItem = async (key: string) => {
  const value = await client.get(key);
  if (!value) return null;
  console.log("cache hit");
  return JSON.parse(value);
};

const disconnectRedis = () => {
  client.disconnect();
};

export { saveItemToRedis, getRedisItem, initRedis, disconnectRedis };
