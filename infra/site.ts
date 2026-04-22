import { router } from "./router";
import { api } from "./api";

export const site = new sst.aws.StaticSite("Web", {
  path: "packages/web",
  build: {
    command: "npm run build",
    output: "dist",
  },
  environment: {
    VITE_API_URL: $dev ? api.url : $interpolate`${router.url}`,
  },
  router: {
    instance: router,
  },
});
