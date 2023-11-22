# blog-jtken
Blog Posts

## Development

Using SST to deploy to AWS. I am curious to see if that's worth it. 

Steps to get local dev server up

1. In the root directory (i.e the SST app) run `npx sst dev`
2. `cd astro/` and then rn `npm run dev`
3. At this point the dev server is running on local host

## Deployment

1. `cd astro/` and then run `npm run build`
2. In the root directly run `npx sst build`
3. In the root director (i.e the SST app) run `npm sst deploy --stage prod`
