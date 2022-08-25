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

dotenv.config();
const app: Express = express();
const port = process.env.PORT;
const corsOptions: cors.CorsOptions = {
  origin: "http://localhost:3018",
  methods: ["POST", "PUT", "GET", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("tiny"));
console.log("Bungus: ", process.env.REDISADDR);
/* const client = new Redis({
  //default host/port
}); */
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
        host: "localhost",
        port: 6379,
        ttl: 90000,
      }),
      cookie: {
        maxAge: 360000,
        httpOnly: true,
        sameSite: false,
        secure: process.env.PRODUCTION === "TRUE",
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

app.post("/api/v1/test", (req: Request, res: Response) => {
  req.session.email = "";
  res.send(req.session);
});

app.listen(port, async () => {
  await initClient(elasticClient);
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
