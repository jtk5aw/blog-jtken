import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import aws from "astro-sst";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.jtken.com",
  output: "static",
  integrations: [mdx(), sitemap()],
  adapter: aws(),
});
