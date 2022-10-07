import express, { Request, Response, Router } from "express";
import elasticClient from "../connectES";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: The search API
 */

/**
 * @swagger
 * /blogtitle:
 *   get:
 *     summary: Get blog with query in title
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         description: Query to search for in titles
 *         required: true
 *         schema:
 *           type: string
 *
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
 *                     results:
 *                       type: object
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JsonResponseNoData'
 */

router.get("/blogtitle", async (req: Request, res: Response) => {
  const titleQuery = req.query.q;
  console.log(titleQuery);
  if (typeof titleQuery !== "string") {
    res.status(400).send({ msg: "Bad query", success: false });
  }
  const queryResults = await elasticClient.search({
    index: "posts",
    query: {
      fuzzy: {
        title: { value: titleQuery as string, fuzziness: "AUTO" },
      },
    },
  });

  res.status(200).send({
    msg: "Succesful Query",
    success: true,
    data: {
      results: queryResults,
    },
  });
});

/**
 * @swagger
 * /content:
 *   get:
 *     summary: Get blog with query in body
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: Query to search for in bodies
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
 *                     results:
 *                       type: object
 *
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JsonResponseNoData'
 */

router.get("/content", async (req: Request, res: Response) => {
  const contentQuery = req.query.q;
  console.log(contentQuery);
  if (typeof contentQuery !== "string") {
    res.status(200).send({ msg: "Bad query", success: false });
  }
  const queryResults = await elasticClient.search({
    index: "posts",
    query: {
      match: {
        content: contentQuery as string,
      },
    },
  });
  res.status(200).send({
    msg: "Succesful Query",
    success: true,
    data: {
      results: queryResults,
    },
  });
});

export default router;
