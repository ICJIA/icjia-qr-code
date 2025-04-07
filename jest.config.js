export default {
  testTimeout: 10000, // Set global timeout to 10 seconds
  testEnvironment: "node",
  verbose: true,
  transform: {},
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  runner: "jest-runner",
  testRunner: "jest-circus/runner",
};
