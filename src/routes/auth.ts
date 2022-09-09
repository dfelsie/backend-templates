import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

import express, { Request, Response, Router } from "express";
import prisma from "../prismaClient";
import checkAllString from "../utils/checkAllString";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The authorization API
 */

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Destroy current session/logout current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Succesfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *       500:
 *         description: Error logging out
 */
router.get("/logout", function (req: Request, res: Response) {
  req.session.destroy(function (err) {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.status(200).send({ msg: "Logged out" });
    }
  });
});

/**
 * @swagger
 * /user:
 *   get:
 *     summary: get current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Got current user (possibly null)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 username:
 *                   type: string
 */

router.get("/user", function (req: Request, res: Response) {
  return res.status(200).send({
    email: req.session.email,
    userId: req.session.userId,
    username: req.session.username,
  });
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Attempt to login user.
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request recieved, but possibly failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 success:
 *                   type: boolean
 */

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

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Attempt to register user.
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request recieved, but possibly failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Problem with operation.
 */

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
