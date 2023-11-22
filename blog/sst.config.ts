import { SSTConfig } from "sst";
import { Blog } from "./stacks/MyStack";

export default {
  config(_input) {
    return {
      name: "blog",
      region: "us-west-1",
    };
  },
  stacks(app) {
    app.stack(Blog);
  }
} satisfies SSTConfig;
