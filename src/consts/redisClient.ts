import Redis from "ioredis";

const client = new Redis(6379, process.env.REDIS_HOST ?? "localhost", {
  //default host/port
  //host: "myredis",
  host: process.env.REDIS_HOST,
  port: 6379,
});

/* client.on("error", function (err) {
  console.log("Could not establish a connection with redis. " + err);
});
client.on("connect", function (err) {
  console.log("Connected to redis successfully");
}); */

export default client;
