import { PrismaClient, User, Post } from ".prisma/client";
const prisma = new PrismaClient();

async function clear() {
  await prisma.follows.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
}
clear();
