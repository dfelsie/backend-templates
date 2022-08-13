import Redis from "ioredis";

const client = new Redis({
  //default host/port
});

/* client.on("error", function (err) {
  console.log("Could not establish a connection with redis. " + err);
});
client.on("connect", function (err) {
  console.log("Connected to redis successfully");
}); */

export default client;
