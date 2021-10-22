import type {
  Config
} from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testMatch: [`${__dirname}/test/*.test.ts`],
  verbose: true
};

export default config;
