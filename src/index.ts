import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import client from "./consts/redisClient";
import connectRedis from "connect-redis";
import authRoutes from "./routes/auth";
import dataRoutes from "./routes/data";
import searchRoutes from "./routes/search";
import elasticClient, { initClient } from "./connectES";
import swaggerUI, { SwaggerOptions } from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import {
  PRODUCTION,
  REDIS_HOST,
  REDIS_PORT,
  SERVER_PORT,
  USE_SWAGGER,
} from "./consts/envConsts";
dotenv.config({
  path: "C:\\Users\\DLF\\Documents\\newCode\\templates\\backend-templates\\.env",
});
const app: Express = express();
const PORT = SERVER_PORT;

const corsOptions: cors.CorsOptions = {
  //origin: "http://blogfront:3018",
  origin: "http://localhost:3018",
  methods: ["POST", "PUT", "GET", "DELETE", "OPTIONS"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("tiny"));

declare module "express-session" {
  export interface SessionData {
    email: string;
    userId: string;
    username: string;
  }
}

const RedisStore = connectRedis(session);
try {
  app.use(
    session({
      secret: "this_is_a_secret",
      resave: false,
      saveUninitialized: false,
      //rolling: true, // forces resetting of max age
      store: new RedisStore({
        client,
        host: REDIS_HOST,
        port: REDIS_PORT,
        //url: "redis://myredis:6379",
        ttl: 90000,
        logErrors: true,
      }),
      cookie: {
        maxAge: 360000,
        httpOnly: true,
        sameSite: false,
        secure: PRODUCTION === "TRUE",
      },
    })
  );
} catch (e) {
  console.log("Redis error: ", e);
}

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/data", dataRoutes);
app.use("/api/v1/search", searchRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript + Passport Server");
});
if (USE_SWAGGER === "true") {
  const options: SwaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Blog API",
        version: "3.0.0",
        description: "simple blog api",
      },
      servers: [{ url: `http://localhost:${PORT ?? 3012}` }],
    },
    apis: ["./src/routes/*.ts", "./src/swaggerCode/swaggerTypes.ts"],
  };
  const openApiSpecification = swaggerJsdoc(options);
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(openApiSpecification));
  console.log("Swagger set up!");
}
app.listen(PORT, async () => {
  await initClient(elasticClient);
  console.log(
    `⚡️[server]: Server is running at https://localhost:${PORT ?? 3012}`
  );
});
