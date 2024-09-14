# blog-jtken
Blog Posts

## Development

Using SST to deploy to AWS. I am curious to see if that's worth it.

Steps to get local dev server up

0. Make sure that SSTV2 is installed. SSTV3 won't work. Use `npm install sst@two --save-exact` to download
1. In the root directory (i.e the SST app) run `npx sst dev`
2. `cd astro/` and then rn `npm run dev`
3. At this point the dev server is running on local host

## Deployment

1. `cd astro/` and then run `npm run build`
2. In the root directly run `npx sst build`
3. In the root director (i.e the SST app) run `npx sst deploy --stage prod`

## Misc

This CLI is great for converting mermaid diagrams to SVGs that can then be included in posts https://github.com/mermaid-js/mermaid-cli. There's also a way to include them directly in the astro markdown but I couldn't get that to work.
