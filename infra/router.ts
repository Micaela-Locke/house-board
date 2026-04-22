/* Single Router — site on root, API on /api.
   No custom domain yet; we can add one by filling in the conditional below. */
const domain =
  $app.stage === "prod"
    ? undefined // e.g. "houseboard.micaelaconners.com" when ready
    : undefined;

export const router = new sst.aws.Router("Router", {
  ...(domain && { domain }),
});
