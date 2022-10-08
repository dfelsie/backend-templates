import Redis from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "./envConsts";

const client = new Redis(REDIS_PORT, REDIS_HOST ?? "localhost", {
  //default host/port
  //host: "myredis",
  host: REDIS_HOST,
  port: REDIS_PORT,
});

/* client.on("error", function (err) {
  console.log("Could not establish a connection with redis. " + err);
});
client.on("connect", function (err) {
  console.log("Connected to redis successfully");
}); */

export default client;
