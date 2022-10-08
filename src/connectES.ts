import elasticSearch from "@elastic/elasticsearch";
import {
  ELASTIC_ADDRESS,
  ELASTIC_PASSWORD,
  ELASTIC_USER,
} from "./consts/envConsts";
import prisma from "./prismaClient";

function connectElasticClient() {
  try {
    const client = new elasticSearch.Client({
      //node: "https://localhost:9200",
      //node: "https://es01:9200",
      node: ELASTIC_ADDRESS,
      maxRetries: 5,
      requestTimeout: 60000,
      sniffOnStart: true,
      Connection: elasticSearch.HttpConnection,
      auth: {
        //Comments stuff for docker, uncommented parts are local
        username: ELASTIC_USER ?? "elastic",
        password: ELASTIC_PASSWORD ?? "elasticpassword",
        //Local:

        //username: "elastic",
        //password: "elasticpassword",

        //Docker:

        //username: "elastic",
        //password: "changeme",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    //client.cluster.health().then((res) => console.log(res));

    return client;
  } catch (error) {
    console.log(error);
    process.exit(0);
  }
}

export async function initClient(elasticClient: elasticSearch.Client) {
  try {
    if (
      await elasticClient.indices.exists({
        index: "posts",
      })
    ) {
      console.log("In existence!");
    } else {
      await elasticClient.indices.create({
        index: "posts",
      });
    }
  } catch (e) {
    console.log(e);
  }
  const allPosts = await prisma.post.findMany();
  const opAndBodyList = [];
  for (let i = 0; i < allPosts.length; i++) {
    const element = allPosts[i];
    const op = {
      index: {
        _index: "posts",
        // _type: "posts",
        _id: element.id,
      },
    };
    const body = {
      title: element.title,
      content: element.content,
      id: element.id,
    };
    opAndBodyList.push(op, body);

    //elasticPosts.push({_index:"posts",_type:"posts",_id:element.id})
    //elasticPosts.push({"title":element.title,"content":element.content})
  }
  elasticClient
    .bulk({
      operations: opAndBodyList,
    })
    .then((res) => {
      console.log("Created");
    })
    .catch((err) => console.log(err));
}

const elasticClient = connectElasticClient();
export default elasticClient;
