import { PrismaClient } from "@prisma/client";
import express, { Request, Response, Router } from "express";
import prisma from "../prismaClient";
import checkAllString from "../utils/checkAllString";

const router: Router = express.Router();

router.post("/checkifnameunique", async (req: Request, res: Response) => {
  const usernameToCheck = req.body.usernameToCheck;
  if (!checkAllString(usernameToCheck))
    return res.send({ msg: "No usernameToCheck" });

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
  if (!checkAllString(emailToCheck))
    return res.send({ msg: "No usernameToCheck" });

  //const blogIdNumber = parseInt(usernameToCheck);
  const userWithSameEmail = await prisma.user.findFirst({
    where: {
      email: emailToCheck,
    },
  });
  return res.json({ emailUnique: userWithSameEmail === null });
});

router.post("/addblog", async (req: Request, res: Response) => {
  //const currUserData = await getUserData(client);
  if (!req.session.email)
    return res.send({ msg: "Not logged in", success: false });
  if (!req.body.title || !req.body.content) {
    res.status(400).send({ msg: "Bad request", success: false });
  }

  const user = await prisma.user.findFirst({
    where: {
      email: req.session.email,
    },
  });
  if (user === null) {
    return res.send("Odd error");
  }

  const post = await prisma.post.create({
    data: {
      title: req.body.title,
      content: req.body.content,
      author: {
        connect: {
          name: user.name,
        },
      },
    },
  });
  res.status(200).send({ msg: "Post Uploaded!", success: true });
});

router.get("/getuserblogs/:username", async (req: Request, res: Response) => {
  const userName = req.params.username as string;
  if (!userName) {
    res.status(400).send("Bad request");
  }
  const user = await prisma.user.findFirst({
    where: {
      name: userName,
    },
  });
  const userId = user?.id.toString();
  if (userId == undefined) {
    return;
  }

  const blogs = await prisma.post.findMany({
    where: {
      author: {
        name: userName,
      },
    },
    take: 5,
  });
  /*   const followers = await prisma.follows.findMany({
    where: {
      followerId: userId,
    },
    take: 5,
  });
  const follows = await prisma.follows.findMany({
    where: {
      followerId: userId,
    },
    take: 5,
  }); */
  return res.status(200).send({
    msg: "Success!",
    success: true,
    data: {
      //followers: followers,
      //follows: follows,
      blogs: blogs,
    },
  });
});

router.get("/useroverview/:userid", async (req: Request, res: Response) => {
  const userId = req.params.userid as string;
  if (!userId) {
    return res.status(400).send({ msg: "Bad request", success: false });
  }
  const userIdNum = parseInt(userId);
  if (userIdNum === NaN) {
    return res.status(400).send({ msg: "Bad request", success: false });
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userIdNum,
    },
  });
  if (!user) {
    return res.status(400).send({ msg: "Bad request", success: false });
  }

  const userName = user.name;

  const blogs = await prisma.post.findMany({
    where: {
      author: {
        id: userIdNum,
      },
    },
    take: 5,
  });
  const followers = await prisma.follows.findMany({
    //Note: FollowingId a string, refering to name
    where: {
      followingName: userName,
    },
    include: {
      follower: true,
    },
    take: 5,
  });
  const follows = await prisma.follows.findMany({
    where: {
      followerName: userName,
    },
    take: 5,
  });
  return res.status(200).send({
    msg: "Success!",
    success: true,
    data: {
      name: userName,
      followers: followers,
      follows: follows,
      blogs: blogs,
    },
  });
});

router.post("/addfollow", async (req: Request, res: Response) => {
  if (!req?.session?.username) {
    res.status(200).send({
      msg: "Not logged in",
      success: false,
    });
  }
  const followerId = req.body?.followerId;
  const followingName = req.body?.followingName;
  if (!checkAllString(followerId, followingName)) {
    res.status(200).send({
      msg: "Bad reqs",
      success: false,
    });
  }

  await prisma.follows.create({
    data: {
      follower: {
        connect: {
          name: req.session.username,
        },
      },
      following: {
        connect: {
          name: followingName,
        },
      },
    },
  });
  return res.status(200).send({ msg: "Success", success: true });
});
router.delete(
  "/deletefollow/:username",
  async (req: Request, res: Response) => {
    //Have to do this to keep prisma types happy in query
    const currUserNameTemp = req?.session?.username;
    if (typeof currUserNameTemp !== "string") {
      res.status(200).send({
        msg: "Not logged in",
        success: false,
      });
    }
    const currUserName: string = currUserNameTemp as string;
    const followingName = req.params.username as string;
    if (!followingName) {
      res.status(400).send({ msg: "Bad Request", success: false });
    }
    await prisma.follows.delete({
      where: {
        followerName_followingName: {
          followerName: currUserName as string,
          followingName: followingName,
        },
      },
    });
    return res.status(200).send({ msg: "Success", success: true });
  }
);

router.get(
  "/iscurruserfollowing/:username",
  async (req: Request, res: Response) => {
    const userName = req.params.username as string;
    if (!userName) {
      res.status(400).send({ msg: "Bad Request", success: false });
    }
    if (!req.session.username) {
      res.status(400).send({ msg: "Not logged in", success: false });
    }
    try {
      const follow = await prisma.follows.findFirst({
        where: {
          followerName: req.session.username,
          followingName: userName,
        },
      });
      return res.status(200).send({
        msg: "Retrieved",
        success: true,
        data: {
          follow,
        },
      });
    } catch (PrismaClientKnownRequestError) {
      return res.status(400).send({
        msg: "Already exists",
        success: false,
      });
    }
  }
);

router.get("/getblog/:blogid", async (req: Request, res: Response) => {
  const blogId = req.params.blogid as string;
  if (!blogId || parseInt(blogId) === NaN) {
    res.status(400).send("Bad request");
  }
  const blog = await prisma.post.findFirst({
    where: {
      id: parseInt(blogId),
    },
  });

  return res.status(200).send({
    msg: "Success!",
    success: true,
    data: {
      blog: blog,
    },
  });
});

export default router;
