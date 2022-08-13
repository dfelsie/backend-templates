import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";
import express, { Request, Response, Router } from "express";
import checkAllString from "../utils/checkAllString";

const prisma = new PrismaClient();

const router: Router = express.Router();

router.get("/logout", function (req: Request, res: Response) {
  req.session.destroy(function (err) {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send("Logged out");
    }
  });
});

router.get("/user", function (req: Request, res: Response) {
  return res.status(200).send({ email: req.session.email });
});

router.post("/login", async function (req: Request, res: Response) {
  // when user login set the key to redis.

  const reqEmail = req.body.email;
  const reqPassword = req.body.password;
  if (!checkAllString(reqEmail, reqPassword)) {
    return res.status(400).send("Bad request");
  }
  const user = await prisma.user.findFirst({
    where: {
      email: req.body.email,
    },
  });
  if (!user) {
    return res.status(400).send("Bad request");
  }
  const passwordHash = await argon2.hash(req.body.password);
  if (!argon2.verify(user.password, passwordHash)) {
    return res.status(400).send("Bad request");
  }
  req.session.email = reqEmail;
  req.session.save();

  res.send("Logged in");
});

router.post("/register", async (req: Request, res: Response) => {
  //if (await checkLoggedIn(client)) return res.send("Already logged in");

  const { name, email, password } = req.body;
  if (!checkAllString(name, email, password)) {
    return res.status(400).send("Bad request");
  }
  if (await prisma.user.findFirst({ where: { email } })) {
    return res.status(400).send("User already exists");
  }

  const passwordHash = await argon2.hash(password);
  try {
    const result = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        displayName: name,
      },
    });

    //client.set("userData", JSON.stringify(makeUserDataFromUser(result)));
    //res.header("Access-Control-Allow-Credentials", "true");

    req.session.email = email;

    return res.send("You're Registered!").status(200);
  } catch (e) {
    return res.status(400);
  }
});

export default router;
