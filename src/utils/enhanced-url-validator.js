import validator from 'validator';

/**
 * Enhanced URL validator using the validator.js library
 * Handles edge cases like:
 * - Multiple trailing slashes
 * - Spaces in URLs
 * - Special characters
 * - URL encoding issues
 * - Malformed URLs
 * - And more
 *
 * @param {string} input - The URL to validate
 * @returns {Object} - Validation result with isValid flag and additional information
 */
export function validateAndSanitizeURL(input) {
  try {
    // First, trim the input
    const trimmedUrl = input.trim();

    // Check if URL is empty after trimming
    if (!trimmedUrl) {
      return {
        isValid: false,
        error: "URL cannot be empty",
      };
    }

    // Pre-process the URL to handle spaces and special characters
    // This helps with validation of URLs that contain spaces or special characters
    let processedUrl = trimmedUrl;
    let originalUrl = trimmedUrl;
    let hasWarnings = false;
    let warnings = [];
    let needsEncoding = false;

    // Check if the URL contains unescaped spaces
    if (processedUrl.includes(' ')) {
      // URLs with unescaped spaces should be considered invalid
      // This is a strict validation requirement
      return {
        isValid: false,
        error: "URLs with unescaped spaces are invalid. Please encode spaces as %20.",
        originalUrl: processedUrl,
        suggestedUrl: processedUrl.replace(/ /g, '%20')
      };
    }

    // Check for other special characters that might need encoding
    // but don't invalidate the URL (we'll encode them later)
    if (/[\{\}\|\\\^\~\[\]`<>#"]/g.test(processedUrl)) {
      needsEncoding = true;
    }

    // Try to parse the URL (original or encoded)
    try {
      new URL(processedUrl);
    } catch (e) {
      return {
        isValid: false,
        error: "Invalid URL format. Please enter a valid URL starting with http:// or https://",
        details: e.message
      };
    }

    // Basic URL validation with validator.js
    // Use more lenient options to allow spaces and special characters
    const urlOptions = {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
      require_host: true,
      validate_length: true,
      allow_underscores: true,
      allow_trailing_dot: true,
      allow_fragments: true,
      allow_query_components: true
    };

    // If the URL contains spaces or special characters, we'll handle it ourselves
    // rather than relying on validator.js's strict validation
    if (!validator.isURL(processedUrl, urlOptions) && !needsEncoding) {
      return {
        isValid: false,
        error: "Invalid URL format. Please enter a valid URL starting with http:// or https://",
      };
    }

    // Parse URL to check for other issues and normalize
    const urlObject = new URL(processedUrl);

    // Special case for IP addresses
    const hostname = urlObject.hostname;
    const ipv4Regex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

    if (ipv4Regex.test(hostname)) {
      // This is an IP address, so we'll skip the TLD and domain part checks
      // The original validator allowed IP addresses
    } else {
      // Check for valid hostname (must have at least one dot and valid TLD)
      // This maintains compatibility with the original validator
      const validTLDs = ["com", "org", "net", "edu", "gov", "eu"];
      const tld = hostname.split(".").pop();

      if (!hostname.includes(".") || !validTLDs.includes(tld)) {
        return {
          isValid: false,
          error: "Invalid domain format or TLD. Please check the URL",
        };
      }

      // The original validator allowed domains with hyphens in any position
      // including at the beginning and end of domain parts
      // This is not RFC-compliant but we need to match the original behavior
    }

    let normalizedUrl = urlObject.toString();

    // Check for multiple trailing slashes
    const hasMultipleTrailingSlashes = /[\/]{2,}$/.test(trimmedUrl);
    if (hasMultipleTrailingSlashes) {
      // Handle the case where the URL has query parameters or hash fragments
      let correctedUrl;
      if (trimmedUrl.includes('?') || trimmedUrl.includes('#')) {
        // For URLs with query parameters or hash, we need to be more careful
        // Split the URL into parts
        const urlParts = trimmedUrl.match(/^(https?:\/\/[^\/?#]+)([^?#]*)(\?[^#]*)?(#.*)?$/);
        if (urlParts) {
          const [, baseUrl, path, query, hash] = urlParts;

          // Fix trailing slashes in the path part
          const fixedPath = path ? path.replace(/[\/]+$/, "/") : "";

          // Reconstruct the URL
          correctedUrl = baseUrl + fixedPath + (query || "") + (hash || "");
        } else {
          // Fallback if we can't parse the URL
          correctedUrl = trimmedUrl.replace(/[\/]+$/, "/");
        }
      } else {
        // Simple case: just replace trailing slashes
        correctedUrl = trimmedUrl.replace(/[\/]+$/, "/");
      }

      normalizedUrl = new URL(correctedUrl).toString();
      hasWarnings = true;
      warnings.push("Multiple trailing slashes detected and corrected");
    }

    // Check for multiple consecutive slashes in the path
    if (/([^:]\/)\/+/.test(trimmedUrl)) {
      const correctedUrl = trimmedUrl.replace(/([^:]\/)\/+/g, "$1");
      normalizedUrl = new URL(correctedUrl).toString();
      hasWarnings = true;
      warnings.push("Multiple consecutive slashes in path detected and corrected");
    }

    // Check if URL needs encoding (if we haven't already determined this)
    if (!needsEncoding) {
      // Check pathname for spaces and special characters
      const pathParts = urlObject.pathname.split("/");
      for (const part of pathParts) {
        if (part && part !== encodeURIComponent(part)) {
          needsEncoding = true;
          break;
        }
      }

      // Check search params
      if (urlObject.search) {
        const searchParams = new URLSearchParams(urlObject.search);
        for (const [key, value] of searchParams.entries()) {
          if (
            key !== encodeURIComponent(key) ||
            value !== encodeURIComponent(value)
          ) {
            needsEncoding = true;
            break;
          }
        }
      }

      // Check hash
      if (
        urlObject.hash &&
        urlObject.hash.slice(1) !== encodeURIComponent(urlObject.hash.slice(1))
      ) {
        needsEncoding = true;
      }
    }

    // If encoding is needed, create properly encoded URL
    if (needsEncoding) {
      const encodedUrl = new URL(processedUrl);

      // Encode pathname parts
      const pathParts = urlObject.pathname.split("/");
      encodedUrl.pathname = pathParts
        .map((part) => (part ? encodeURIComponent(decodeURIComponent(part)) : ""))
        .join("/");

      // Handle query parameters properly
      if (urlObject.search) {
        const searchParams = new URLSearchParams(urlObject.search);
        const encodedParams = [];

        for (const [key, value] of searchParams.entries()) {
          // First decode any already encoded values
          const decodedKey = decodeURIComponent(key);
          const decodedValue = decodeURIComponent(value);

          // Encode special characters
          encodedParams.push(`${encodeURIComponent(decodedKey)}=${encodeURIComponent(decodedValue)}`);
        }

        encodedUrl.search = encodedParams.length > 0 ? `?${encodedParams.join("&")}` : "";
      }

      // Encode hash
      if (urlObject.hash) {
        encodedUrl.hash = "#" + encodeURIComponent(decodeURIComponent(urlObject.hash.slice(1)));
      }

      normalizedUrl = encodedUrl.toString();
      hasWarnings = true;
      warnings.push("URL contained unencoded characters and has been properly encoded");
    }

    // Return the validation result
    return {
      isValid: true,
      url: normalizedUrl,
      originalUrl: originalUrl,
      hasWarnings: hasWarnings,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      isValid: false,
      error: "Invalid URL format. Please check the URL",
      details: error.message
    };
  }
}
