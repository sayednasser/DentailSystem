import { createClient } from "redis";
import { REDIS_URI } from "../../config/config.js";


export const redisClient = createClient({
url:REDIS_URI,
});

export const connectRedis = async () => {
    try {
        const client = await redisClient.connect();
        console.log("redis connected successfully✔😎");

    } catch (error) {
        console.log("failed to connect redis❌😒", error);

    }
}
