/**
 * @jest-environment node
 */

import { validateAndSanitizeURL } from "../src/utils/enhanced-url-validator.js";

describe("Enhanced URL Validation Tests", () => {
  describe("Basic URL validation", () => {
    it("should validate a simple valid URL", () => {
      const result = validateAndSanitizeURL("https://example.com");
      expect(result.isValid).toBe(true);
      expect(result.url).toBe("https://example.com/");
    });

    it("should reject an invalid URL", () => {
      const result = validateAndSanitizeURL("not-a-url");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should require http or https protocol", () => {
      const result = validateAndSanitizeURL("ftp://example.com");
      expect(result.isValid).toBe(false);
    });

    it("should handle empty input", () => {
      const result = validateAndSanitizeURL("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("URL cannot be empty");
    });

    it("should handle whitespace-only input", () => {
      const result = validateAndSanitizeURL("   ");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("URL cannot be empty");
    });
  });

  describe("URL normalization and correction", () => {
    it("should detect and correct multiple trailing slashes", () => {
      const result = validateAndSanitizeURL("https://example.com///");
      expect(result.isValid).toBe(true);
      expect(result.hasWarnings).toBe(true);
      expect(result.warnings).toContain("Multiple trailing slashes detected and corrected");
      expect(result.url).toBe("https://example.com/");
    });

    it("should normalize multiple consecutive slashes in the path", () => {
      const result = validateAndSanitizeURL("https://example.com/path//to///resource");
      expect(result.isValid).toBe(true);
      expect(result.hasWarnings).toBe(true);
      expect(result.warnings).toContain("Multiple consecutive slashes in path detected and corrected");
      expect(result.url).toBe("https://example.com/path/to/resource");
    });

    it("should reject URLs with unescaped spaces", () => {
      const result = validateAndSanitizeURL("https://example.com/path with spaces");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.suggestedUrl).toBe("https://example.com/path%20with%20spaces");
    });

    it("should accept URLs with encoded spaces", () => {
      const result = validateAndSanitizeURL("https://example.com/path%20with%20spaces");
      expect(result.isValid).toBe(true);
    });

    it("should properly encode special characters in URLs", () => {
      const result = validateAndSanitizeURL("https://example.com/path/with/特殊文字");
      expect(result.isValid).toBe(true);
      expect(result.hasWarnings).toBe(true);
      expect(result.url).toContain("https://example.com/path/with/");
      // The exact encoding might vary, but it should be properly encoded
    });
  });

  describe("Edge cases", () => {
    it("should handle URLs with query parameters", () => {
      const result = validateAndSanitizeURL("https://example.com/search?q=test&page=1");
      expect(result.isValid).toBe(true);
    });

    it("should handle URLs with hash fragments", () => {
      const result = validateAndSanitizeURL("https://example.com/page#section");
      expect(result.isValid).toBe(true);
    });

    it("should reject URLs with unescaped spaces in query parameters", () => {
      const result = validateAndSanitizeURL("https://example.com/search?q=test with spaces");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.suggestedUrl).toBe("https://example.com/search?q=test%20with%20spaces");
    });

    it("should accept URLs with encoded spaces in query parameters", () => {
      const result = validateAndSanitizeURL("https://example.com/search?q=test%20with%20spaces");
      expect(result.isValid).toBe(true);
    });

    it("should reject URLs with unescaped spaces in hash fragments", () => {
      const result = validateAndSanitizeURL("https://example.com/page#section with spaces");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.suggestedUrl).toBe("https://example.com/page#section%20with%20spaces");
    });

    it("should accept URLs with encoded spaces in hash fragments", () => {
      const result = validateAndSanitizeURL("https://example.com/page#section%20with%20spaces");
      expect(result.isValid).toBe(true);
    });

    it("should handle URLs with IP addresses", () => {
      const result = validateAndSanitizeURL("http://192.168.1.1/path");
      expect(result.isValid).toBe(true);
    });

    it("should handle URLs with ports", () => {
      const result = validateAndSanitizeURL("http://example.com:8080/path");
      expect(result.isValid).toBe(true);
    });

    it("should handle URLs with authentication", () => {
      const result = validateAndSanitizeURL("http://user:pass@example.com/path");
      expect(result.isValid).toBe(true);
    });
  });
});
