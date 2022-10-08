import dotenv from "dotenv";
import path from "path";

const envPath = path.join(
  __dirname,
  "../../../environment/express-prisma-sessions/.env"
);
const sampleEnvPath = path.join(
  __dirname,
  "../../../environment/sample-environment-files/.env"
);
dotenv.config({
  path: envPath,
  //uncomment below (and recomment above) to use sample environment file.
  // path: sampleEnvPath
});
export const ELASTIC_ADDRESS = process.env.ELASTIC_ADDRESS;
export const ELASTIC_USER = process.env.ELASTIC_USER;
export const ELASTIC_PASSWORD = process.env.ELASTIC_PASSWORD;
export const SERVER_PORT = process.env.SERVER_PORT;
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? "6379");
export const PRODUCTION = process.env.PRODUCTION;
export const USE_SWAGGER = process.env.USE_SWAGGER;
