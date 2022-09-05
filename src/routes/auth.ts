import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

import express, { Request, Response, Router } from "express";
import prisma from "../prismaClient";
import checkAllString from "../utils/checkAllString";

const router: Router = express.Router();

router.get("/logout", function (req: Request, res: Response) {
  req.session.destroy(function (err) {
    if (err) {
      return res.send(err);
    } else {
      return res.status(200).send({ msg: "Logged out" });
    }
  });
});

router.get("/user", function (req: Request, res: Response) {
  return res.status(200).send({
    email: req.session.email,
    userId: req.session.userId,
    username: req.session.username,
  });
});

router.post("/login", async function (req: Request, res: Response) {
  // when user login set the key to redis.

  const reqEmail = req.body.email;
  const reqPassword = req.body.password;
  if (!checkAllString(reqEmail, reqPassword)) {
    return res.status(200).send({ msg: "Bad request", success: false });
  }
  const user = await prisma.user.findFirst({
    where: {
      email: req.body.email,
    },
  });
  if (!user) {
    return res.status(200).send({ msg: "Bad request", success: false });
  }
  const passwordHash = await argon2.hash(req.body.password);
  if (!argon2.verify(user.password, passwordHash)) {
    return res.status(200).send({ msg: "Bad request", success: false });
  }
  req.session.email = user.email;
  req.session.userId = user.id.toString();
  req.session.username = user.name;

  res.send({ msg: "Logged in", success: true });
});

router.post("/register", async (req: Request, res: Response) => {
  //if (await checkLoggedIn(client)) return res.send("Already logged in");

  const { name, email, password } = req.body;
  if (!checkAllString(name, email, password)) {
    return res.status(200).send({ msg: "Bad request", success: false });
  }
  if (await prisma.user.findFirst({ where: { email } })) {
    return res.status(200).send({ msg: "User already exists", success: false });
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
    req.session.userId = result.id.toString();
    req.session.username = name;

    return res.send({ msg: "You're Registered!", success: true }).status(200);
  } catch (e) {
    return res.status(400);
  }
});

export default router;
