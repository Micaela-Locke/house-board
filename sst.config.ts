/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "hib",
      removal: input?.stage === "prod" ? "retain" : "remove",
      protect: ["prod"].includes(input?.stage ?? ""),
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",
        },
      },
    };
  },
  async run() {
    const storage = await import("./infra/storage");
    const router = await import("./infra/router");
    const api = await import("./infra/api");
    const site = await import("./infra/site");

    return {
      BoardBucket: storage.boardBucket.name,
      RouterUrl: router.router.url,
      ApiUrl: api.api.url,
      SiteUrl: site.site.url,
    };
  },
});
