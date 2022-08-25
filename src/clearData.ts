import { PrismaClient, User, Post } from ".prisma/client";
import prisma from "./prismaClient";

async function clear() {
  await prisma.follows.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
}
clear();
