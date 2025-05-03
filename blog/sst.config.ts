/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "blog",
      removal: input?.stage === "production" ? "remove" : "remove",
      //protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const domainName =
      $app.stage === "production"
        ? "blog.jtken.com"
        : `${$app.stage}.blog.jtken.com`;

    const blog = new sst.aws.Astro("MyBlog", {
      path: "astro/",
      domain: domainName,
    });
  },
});
