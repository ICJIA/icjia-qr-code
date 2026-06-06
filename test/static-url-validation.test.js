import { sanitizeAndValidateURL } from "../src/scripts/url-validator.js";
import testUrls from "./fixtures/test-urls.json";

// Custom logger to output test results in a single line
const log = (...args) => process.stdout.write(args.join(" ") + "\n");

// Using static test URLs from the JSON file
const { validURLs, invalidURLs } = testUrls;

describe("Static URL Validation Test Suite", () => {
  const testResults = {
    valid: [],
    invalid: [],
    total: 0,
    passed: 0,
    failed: 0,
  };

  describe("URL Validation Tests (30 test cases)", () => {
    log("\n=== Testing Valid URLs (15 cases) ===");

    validURLs.forEach((url, index) => {
      test(`Valid URL #${index + 1}: ${url}`, () => {
        const result = sanitizeAndValidateURL(url);
        testResults.total++;

        try {
          expect(result.isValid).toBe(true);
          testResults.valid.push({ url, passed: true });
          testResults.passed++;
          log("✅", "Valid URL test passed:", url);
        } catch (error) {
          testResults.valid.push({ url, passed: false });
          testResults.failed++;
          log("❌", "Valid URL test failed:", url);
          throw error;
        }
      });
    });

    log("\n=== Testing Invalid URLs (15 cases) ===");

    invalidURLs.forEach((url, index) => {
      test(`Invalid URL #${index + 1}: ${url}`, () => {
        const result = sanitizeAndValidateURL(url);
        testResults.total++;

        try {
          expect(result.isValid).toBe(false);
          testResults.invalid.push({ url, passed: true });
          testResults.passed++;
          log("✅", "Invalid URL test passed:", url);
        } catch (error) {
          testResults.invalid.push({ url, passed: false });
          testResults.failed++;
          log("❌", "Invalid URL test failed:", url);
          throw error;
        }
      });
    });

    afterAll(() => {
      log("\n=== URL Validation Summary ===");
      log(`Total URL validations: ${testResults.total} (${validURLs.length} valid + ${invalidURLs.length} invalid)`);
      log(`Passed: ${testResults.passed} | Failed: ${testResults.failed}`);
      log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
    });
  });

  describe("URL Encoding Tests (4 test cases)", () => {
    log("\n=== Testing URL Encoding ===");

    test("URL encoding test - Double trailing slash", () => {
      const url = "https://example.com//";
      const result = sanitizeAndValidateURL(url);
      expect(result.isValid).toBe(true);
      expect(result.url || result.suggestedUrl).toBe("https://example.com/");
      log("✅", "URL encoding test passed:", url, "→", result.url || result.suggestedUrl);
    });

    test("URL encoding test - URL with spaces", () => {
      const url = "https://example.com/path with spaces/";
      const result = sanitizeAndValidateURL(url);
      expect(result.isValid).toBe(false);
      expect(result.suggestedUrl).toBe("https://example.com/path%20with%20spaces/");
      log("✅", "URL encoding test passed:", url, "→", result.suggestedUrl);
    });

    test("URL encoding test - URL with special characters", () => {
      const url = "https://example.com/path/with/特殊文字";
      const result = sanitizeAndValidateURL(url);
      expect(result.isValid).toBe(true);
      expect(result.url || result.suggestedUrl).toContain("https://example.com/path/with/");
      log("✅", "URL encoding test passed:", url, "→", result.url || result.suggestedUrl);
    });

    test("URL encoding test - Multiple consecutive slashes", () => {
      const url = "https://example.com/path//with///multiple////slashes";
      const result = sanitizeAndValidateURL(url);
      expect(result.isValid).toBe(true);
      expect(result.url || result.suggestedUrl).toBe("https://example.com/path/with/multiple/slashes");
      log("✅", "URL encoding test passed:", url, "→", result.url || result.suggestedUrl);
    });

    afterAll(() => {
      log("\n=== URL Encoding Tests Summary ===");
      log("All 4 URL encoding test cases completed");
    });
  });

  describe("Double Trailing Slash Tests (3 test cases)", () => {
    log("\n=== Testing Double Trailing Slash Cases ===");

    test("should detect and correct double trailing slash", () => {
      const url = "https://example.com//";
      const result = sanitizeAndValidateURL(url);
      expect(result.isValid).toBe(true);
      expect(result.warning).toBe("Double trailing slash detected");
      expect(result.suggestedUrl).toBe("https://example.com/");
      log("✅", "Double trailing slash test passed:", url, "→", result.suggestedUrl);
    });

    test("should handle double trailing slash with path", () => {
      const url = "https://example.com/path//";
      const result = sanitizeAndValidateURL(url);
      expect(result.isValid).toBe(true);
      expect(result.warning).toBe("Double trailing slash detected");
      expect(result.suggestedUrl).toBe("https://example.com/path/");
      log("✅", "Path with double trailing slash test passed:", url, "→", result.suggestedUrl);
    });

    test("should handle double trailing slash with query parameters", () => {
      const url = "https://example.com/?param=value//";
      const result = sanitizeAndValidateURL(url);
      expect(result.isValid).toBe(true);
      expect(result.warning).toBe("Double trailing slash detected");
      expect(result.suggestedUrl).toBe("https://example.com/?param=value/");
      log("✅", "Query parameters with double trailing slash test passed:", url, "→", result.suggestedUrl);
    });

    afterAll(() => {
      log("\n=== Double Trailing Slash Tests Summary ===");
      log("All 3 double trailing slash test cases passed");
    });
  });
});
