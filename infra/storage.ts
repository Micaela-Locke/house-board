/* S3 bucket for persisted board JSON and any future uploads. */
export const boardBucket = new sst.aws.Bucket("BoardBucket", {
  cors: {
    allowHeaders: ["*"],
    allowMethods: ["GET", "PUT", "POST", "DELETE"],
    allowOrigins: ["*"],
    maxAge: "1 day",
  },
});
