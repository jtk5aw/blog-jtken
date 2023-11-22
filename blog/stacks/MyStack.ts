import { AstroSite, StackContext } from "sst/constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";

export function Blog({ stack }: StackContext) {

  // Look up hosted zone
  const hostedZone = route53.HostedZone.fromLookup(stack, "HostedZone", {
    domainName: "jtken.com",
  });

  // Create the Astro site
  const site = new AstroSite(stack, "Site", {
    path: "astro/",
    customDomain: {
      domainName: "blog.jtken.com",
      cdk: {
        hostedZone
      }
    },
  });

  // Add the site's URL to stack output
  stack.addOutputs({
    URL: site.url,
  });
}