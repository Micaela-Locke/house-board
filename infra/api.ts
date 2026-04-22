import { boardBucket } from "./storage";
import { router } from "./router";

export const api = new sst.aws.Function("Api", {
  url: {
    cors: false,
  },
  link: [boardBucket],
  handler: "packages/functions/src/api.handler",
  timeout: "10 seconds",
  runtime: "nodejs24.x",
});

router.route("/api", api.url);
