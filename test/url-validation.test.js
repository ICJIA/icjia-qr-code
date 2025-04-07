import { sanitizeAndValidateURL } from "../src/utils/url-validator.js";

// URL Generation Utilities
function generateRandomString(length) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789-_";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function generateValidURL() {
  const protocols = ["http://", "https://"];
  const tlds = [".com", ".org", ".net", ".edu", ".gov"];
  const protocol = protocols[Math.floor(Math.random() * protocols.length)];
  const domain = generateRandomString(Math.floor(Math.random() * 10) + 3);
  const tld = tlds[Math.floor(Math.random() * tlds.length)];
  const path = Math.random() > 0.5 ? "/" + generateRandomString(5) : "";
  const query = Math.random() > 0.7 ? "?param=" + generateRandomString(3) : "";

  return protocol + domain + tld + path + query;
}

function generateInvalidURL() {
  const invalidTypes = [
    () => "not-a-url",
    () => "ftp://" + generateRandomString(5) + ".com",
    () => "http://" + generateRandomString(5),
    () => "https://" + generateRandomString(5),
    () => generateRandomString(10),
    () => "http://" + generateRandomString(5) + ".",
    () => "http:// " + generateRandomString(5) + ".com",
    () => "http://" + generateRandomString(5) + ".invalidtld",
  ];

  return invalidTypes[Math.floor(Math.random() * invalidTypes.length)]();
}

describe("URL Validation Test Suite", () => {
  const testResults = {
    valid: [],
    invalid: [],
    total: 0,
    passed: 0,
    failed: 0,
  };

  // Test valid URLs
  describe("Valid URLs", () => {
    const validURLCount = 20;
    const validURLs = Array.from({ length: validURLCount }, generateValidURL);

    validURLs.forEach((url, index) => {
      test(`Valid URL #${index + 1}: ${url}`, () => {
        const result = sanitizeAndValidateURL(url);
        testResults.total++;

        try {
          expect(result.isValid).toBe(true);
          testResults.valid.push({ url, passed: true });
          testResults.passed++;
        } catch (error) {
          testResults.valid.push({ url, passed: false });
          testResults.failed++;
          throw error;
        }
      });
    });
  });

  // Test invalid URLs
  describe("Invalid URLs", () => {
    const invalidURLCount = 20;
    const invalidURLs = Array.from(
      { length: invalidURLCount },
      generateInvalidURL
    );

    invalidURLs.forEach((url, index) => {
      test(`Invalid URL #${index + 1}: ${url}`, () => {
        const result = sanitizeAndValidateURL(url);
        testResults.total++;

        try {
          expect(result.isValid).toBe(false);
          testResults.invalid.push({ url, passed: true });
          testResults.passed++;
        } catch (error) {
          testResults.invalid.push({ url, passed: false });
          testResults.failed++;
          throw error;
        }
      });
    });
  });

  // After all tests complete, display the dashboard
  afterAll(() => {
    console.log("\n=== URL Validation Test Dashboard ===");
    console.log("Total Tests:", testResults.total);
    console.log("Passed:", testResults.passed);
    console.log("Failed:", testResults.failed);
    console.log(
      "Success Rate:",
      ((testResults.passed / testResults.total) * 100).toFixed(2) + "%"
    );

    console.log("\nValid URLs Test Results:");
    testResults.valid.forEach(({ url, passed }) => {
      console.log(`${passed ? "✅" : "❌"} ${url}`);
    });

    console.log("\nInvalid URLs Test Results:");
    testResults.invalid.forEach(({ url, passed }) => {
      console.log(`${passed ? "✅" : "❌"} ${url}`);
    });

    console.log("\n=== End of Test Dashboard ===");
  });
});
