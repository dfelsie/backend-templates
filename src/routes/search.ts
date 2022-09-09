import express, { Request, Response, Router } from "express";
import elasticClient from "../connectES";

const router: Router = express.Router();

router.get("/blogtitle", async (req: Request, res: Response) => {
  const titleQuery = req.query.q;
  console.log(titleQuery);
  if (typeof titleQuery !== "string") {
    res.status(200).send({ msg: "Bad query", success: false });
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
