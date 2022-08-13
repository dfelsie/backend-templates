import { PrismaClient } from "@prisma/client";
import express, { Request, Response, Router } from "express";
import checkAllString from "../utils/checkAllString";

const prisma = new PrismaClient();

const router: Router = express.Router();

router.post("/checkifnameunique", async (req: Request, res: Response) => {
  const usernameToCheck = req.body.usernameToCheck;
  if (!checkAllString(usernameToCheck)) return res.send("No usernameToCheck");

  //const blogIdNumber = parseInt(usernameToCheck);
  const userWithSameName = await prisma.user.findFirst({
    where: {
      name: usernameToCheck,
    },
  });
  return res.json({ usernameUnique: userWithSameName === null });
});

router.post("/checkifemailunique", async (req: Request, res: Response) => {
  const emailToCheck = req.body.emailToCheck;
  if (!checkAllString(emailToCheck)) return res.send("No usernameToCheck");

  //const blogIdNumber = parseInt(usernameToCheck);
  const userWithSameEmail = await prisma.user.findFirst({
    where: {
      email: emailToCheck,
    },
  });
  return res.json({ emailUnique: userWithSameEmail === null });
});

export default router;
