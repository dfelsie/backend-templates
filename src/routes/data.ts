import { PrismaClient } from "@prisma/client";
import express, { Request, Response, Router } from "express";
import prisma from "../prismaClient";
import checkAllString from "../utils/checkAllString";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Data
 *   description: The data API
 */

/**
 * @swagger
 * /checkifnameunique:
 *   post:
 *     summary: Check if supplied name is used by another user
 *     tags: [Data]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usernameToCheck:
 *                 type: string
 *     responses:
 *       200:
 *         description: Username checked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                       usernameUnique:
 *                         type: boolean
 */

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
  return res.json({
    msg: "email checked",
    success: true,
    data: { usernameUnique: userWithSameName === null },
  });
});

/**
 * @swagger
 * /checkifemailunique:
 *   post:
 *     summary: Check if supplied email is used by another user
 *     tags: [Data]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailToCheck:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email checked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                       emailUnique:
 *                         type: boolean
 */

router.post("/checkifemailunique", async (req: Request, res: Response) => {
  const emailToCheck = req.body.emailToCheck;
  if (!checkAllString(emailToCheck))
    return res.send({ msg: "No usernameToCheck", success: false });

  //const blogIdNumber = parseInt(usernameToCheck);
  const userWithSameEmail = await prisma.user.findFirst({
    where: {
      email: emailToCheck,
    },
  });
  return res.json({
    msg: "email checked",
    success: true,
    data: { emailUnique: userWithSameEmail === null },
  });
});

/**
 * @swagger
 * /addblog:
 *   post:
 *     summary: Attempt to submit a blog.
 *     tags: [Data]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               bodyText:
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

router.post("/addblog", async (req: Request, res: Response) => {
  //const currUserData = await getUserData(client);
  if (!req.session.email)
    return res.send({ msg: "Not logged in", success: false });
  if (!req.body.title || !req.body.bodyText) {
    return res.status(200).send({ msg: "Bad request", success: false });
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
  return res.status(200).send({ msg: "Post Uploaded!", success: true });
});

/**
 * @swagger
 * /addcomment:
 *   post:
 *     summary: Attempt to submit a comment.
 *     tags: [Data]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
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

router.post("/addcomment", async (req: Request, res: Response) => {
  if (!req.session.email)
    return res.send({ msg: "Not logged in", success: false });
  if (!req.body.text) {
    return res.status(200).send({ msg: "Bad request", success: false });
  }

  const user = await prisma.user.findFirst({
    where: {
      email: req.session.email,
    },
  });
  if (user === null) {
    return res.send("Odd error");
  }

  const comment = await prisma.comment.create({
    data: {
      text: req.body.text,
      commenter: {
        connect: {
          name: user.name,
        },
      },
    },
  });
  return res.status(200).send({ msg: "Comment Sent!", success: true });
});

/**
 * @swagger
 * /getuserblogs/{username}:
 *   get:
 *     summary: Get blogs from the user with the provided username
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     blogs:
 *                       type: object
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JsonResponseNoData'
 */

router.get("/getuserblogs/:username", async (req: Request, res: Response) => {
  const userName = req.params.username as string;
  if (!userName) {
    return res.status(400).send({ success: false, msg: "Username improper" });
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

/**
 * @swagger
 * /getuseroverview/{userid}:
 *   get:
 *     summary: Get user with provided id
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     blogs:
 *                       type: object
 *                     followers:
 *                       type: object
 *                     follows:
 *                       type: object
 *                     username:
 *                       type: string
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JsonResponseNoData'
 */

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

/**
 * @swagger
 * /addfollow:
 *   post:
 *     summary: Attempt to add a blog.
 *     tags: [Data]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               followerId:
 *                 type: integer
 *               followingName:
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

router.post("/addfollow", async (req: Request, res: Response) => {
  if (!req?.session?.username) {
    return res.status(200).send({
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

/**
 * @swagger
 * /deletefollow/{username}:
 *   delete:
 *     summary: Attempt to delete a follow.
 *     tags: [Data]
 *     parameters:
 *       - name: username
 *         in: path
 *         description: name of user to unfollow
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request recieved, but possibly failed.
 *         content:
 *           application/json:
 *             schema:
 *             $ref: '#/components/schemas/JsonResponseNoData'
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *             $ref: '#/components/schemas/JsonResponseNoData'
 */

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

/**
 * @swagger
 * /iscurruserfollowing/{username}:
 *   get:
 *     summary: See if the current user is following someone
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: username
 *         description: check if curr user is following this user
 *         required: true
 *         schema:
 *           type: string
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     followerName:
 *                       type: string
 *                     followingName:
 *                       type: string
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JsonResponseNoData'
 */

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
      //Not sure why this is here
      return res.status(400).send({
        msg: "Already exists",
        success: false,
      });
    }
  }
);

/**
 * @swagger
 * /getblog/{blogid}:
 *   get:
 *     summary: Get blog with provided id
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: blogid
 *         required: true
 *         schema:
 *           type: string
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     blog:
 *                       type: object
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JsonResponseNoData'
 */

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
