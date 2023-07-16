// /**
//  * Provide connection to cache (in this case Redis)
//  */
// import Redis from "ioredis";
// import { logger } from "./logger";

// const { REDIS_URL = "localhost", REDIS_PORT = 6379, REDIS_PWD = null } = process.env;
// const client = new Redis({
//     port: REDIS_PORT, // Redis port
//     host: REDIS_URL, // Redis host
//     password: REDIS_PWD,
// });

// const MAX_CACHE_RETRY_ATTEMPTS: number = 20;
// let cacheConnectionAttempts: number = 0;

// /**
//  * Log when cache is connected
//  */
// client.on("connect", () => {
//     logger.info(`Cache connected`);
//     cacheConnectionAttempts = 0; // reset
// });

// /**
//  * Error handler for Redis cache
//  */
// client.on("error", (cacheError) => {
//     if (cacheConnectionAttempts >= MAX_CACHE_RETRY_ATTEMPTS) {
//         logger.warn(`Could not connect to cache after ${cacheConnectionAttempts} attempts. Killing process.`);
//         process.exit(1);
//     }
//     logger.warn(`Error connecting to cache`);
//     logger.warn(cacheError.message);
//     cacheConnectionAttempts++;
// });
// export default client;

