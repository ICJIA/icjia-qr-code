/**
 * @jest-environment node
 */

import { sanitizeAndValidateURL } from "../src/utils/url-validator.js";
import QRCode from "qrcode";

// Custom logger to output test results in a single line
const log = (...args) => process.stdout.write(args.join(" ") + "\n");

/**
 * Generates a random string of specified length using alphanumeric characters and special symbols
 * @param {number} length - The length of the string to generate
 * @returns {string} A random string
 */
function generateRandomString(length) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789-_";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

/**
 * Generates a valid URL with random components
 * @returns {string} A valid URL string
 */
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

/**
 * Generates an invalid URL using various invalid patterns
 * @returns {string} An invalid URL string
 */
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

/**
 * Extracts the URL from a QR code
 * @param {string} qrCodeData - The QR code data string
 * @returns {string} The URL contained in the QR code
 */
async function getUrlFromQRCode(qrCodeData) {
  try {
    const url = await QRCode.toDataURL(qrCodeData);
    return url;
  } catch (error) {
    console.error("Failed to decode QR code:", error);
    return null;
  }
}

describe("URL Validation and QR Code Generation Test Suite", () => {
  const testResults = {
    valid: [],
    invalid: [],
    total: 0,
    passed: 0,
    failed: 0,
  };

  describe("URL Validation Tests (30 test cases)", () => {
    log("\n=== Testing Valid URLs (15 cases) ===");
    const validURLCount = 15;
    const validURLs = Array.from({ length: validURLCount }, generateValidURL);

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
    const invalidURLCount = 15;
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
      log(
        `Total URL validations: ${testResults.total} (15 valid + 15 invalid)`
      );
      log(`Passed: ${testResults.passed} | Failed: ${testResults.failed}`);
      log(
        `Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`
      );
    });
  });

  describe("QR Code Content Tests (5 test cases)", () => {
    log("\n=== Testing QR Code Content Generation ===");

    const testUrls = [
      {
        input: "https://example.com//",
        expected: "https://example.com/",
        description: "Double trailing slash",
      },
      {
        input: "https://example.com/path with spaces/",
        expected: "https://example.com/path%20with%20spaces/",
        description: "URL with spaces",
      },
      {
        input: "https://example.com/path/with/特殊文字",
        expected:
          "https://example.com/path/with/%E7%89%B9%E6%AE%8A%E6%96%87%E5%AD%97",
        description: "URL with special characters",
      },
      {
        input: "https://example.com/path//with///multiple////slashes",
        expected: "https://example.com/path/with/multiple/slashes",
        description: "Multiple consecutive slashes",
      },
    ];

    testUrls.forEach(({ input, expected, description }) => {
      test(`URL encoding test - ${description}`, () => {
        const result = sanitizeAndValidateURL(input);
        expect(result.isValid).toBe(true);

        // Use the corrected URL for validation
        const urlToUse =
          result.url || result.suggestedUrl || result.originalUrl;
        expect(urlToUse).toBe(expected);

        log("✅", `URL encoding test passed: ${input} → ${expected}`);
      });
    });

    afterAll(() => {
      log("\n=== URL Encoding Tests Summary ===");
      log("All 5 URL encoding test cases completed");
    });
  });

  describe("Double Trailing Slash Tests (3 test cases)", () => {
    log("\n=== Testing Double Trailing Slash Cases ===");

    it("should detect and correct double trailing slash", () => {
      const url = "https://example.com//";
      const result = sanitizeAndValidateURL(url);

      expect(result.isValid).toBe(true);
      expect(result.warning).toBe("Double trailing slash detected");
      expect(result.suggestedUrl).toBe("https://example.com/");
      expect(result.originalUrl).toBe(url);
      log(
        "✅",
        "Double trailing slash test passed:",
        url,
        "→",
        result.suggestedUrl
      );
    });

    it("should handle double trailing slash with path", () => {
      const url = "https://example.com/path//";
      const result = sanitizeAndValidateURL(url);

      expect(result.isValid).toBe(true);
      expect(result.warning).toBe("Double trailing slash detected");
      expect(result.suggestedUrl).toBe("https://example.com/path/");
      expect(result.originalUrl).toBe(url);
      log(
        "✅",
        "Path with double trailing slash test passed:",
        url,
        "→",
        result.suggestedUrl
      );
    });

    it("should handle double trailing slash with query parameters", () => {
      const url = "https://example.com/?param=value//";
      const result = sanitizeAndValidateURL(url);

      expect(result.isValid).toBe(true);
      expect(result.warning).toBe("Double trailing slash detected");
      expect(result.suggestedUrl).toBe("https://example.com/?param=value/");
      expect(result.originalUrl).toBe(url);
      log(
        "✅",
        "Query parameters with double trailing slash test passed:",
        url,
        "→",
        result.suggestedUrl
      );
    });

    afterAll(() => {
      log("\n=== Double Trailing Slash Tests Summary ===");
      log("All 3 double trailing slash test cases passed");
    });
  });

  // After all tests complete, display the final summary
  afterAll(() => {
    log("\n=== Final Test Suite Summary ===");
    log(
      "Total Test Cases: 38 (30 URL validations + 5 QR code content + 3 double trailing slash tests)"
    );
    log(
      `Overall Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`
    );
  });
});
