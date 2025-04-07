export function sanitizeAndValidateURL(input) {
  try {
    const sanitizedUrl = input.trim();

    // Check for multiple trailing slashes and fix them
    const hasDoubleTrailingSlash = /[\/]{2,}$/.test(sanitizedUrl);
    let correctedUrl = hasDoubleTrailingSlash
      ? sanitizedUrl.replace(/[\/]+$/, "/") // Replace multiple trailing slashes with a single one
      : sanitizedUrl;

    // Normalize multiple consecutive slashes in the path
    correctedUrl = correctedUrl.replace(/([^:]\/)\/+/g, "$1");

    // Require URL to start with http:// or https://
    if (!/^https?:\/\//i.test(correctedUrl)) {
      return {
        isValid: false,
        error: "URL must start with 'http://' or 'https://'",
      };
    }

    // Parse URL to validate structure
    const urlObject = new URL(correctedUrl);

    // Ensure only http or https protocols are allowed
    if (!["http:", "https:"].includes(urlObject.protocol)) {
      return {
        isValid: false,
        error: "Only HTTP and HTTPS protocols are allowed",
      };
    }

    // Check for valid hostname (must have at least one dot and valid TLD)
    const hostname = urlObject.hostname;
    const validTLDs = ["com", "org", "net", "edu", "gov", "eu"];
    const tld = hostname.split(".").pop();

    if (!hostname.includes(".") || !validTLDs.includes(tld)) {
      return {
        isValid: false,
        error: "Invalid domain format or TLD. Please check the URL",
      };
    }

    // If we found multiple trailing slashes, return warning with corrected URL
    if (hasDoubleTrailingSlash) {
      return {
        isValid: true,
        warning: "Double trailing slash detected",
        originalUrl: sanitizedUrl,
        suggestedUrl: correctedUrl,
      };
    }

    // Create encoded version
    const encodedUrl = new URL(correctedUrl);
    let needsEncoding = false;

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

    // If no encoding needed, return original
    if (!needsEncoding) {
      return {
        isValid: true,
        url: correctedUrl,
        originalUrl: correctedUrl,
      };
    }

    // Encode URL parts
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

        // Encode special characters directly
        const encodedValue = decodedValue
          .replace(/!/g, "%21")
          .replace(/@/g, "%40")
          .replace(/#/g, "%23")
          .replace(/\$/g, "%24");

        encodedParams.push(`${encodeURIComponent(decodedKey)}=${encodedValue}`);
      }

      encodedUrl.search = `?${encodedParams.join("&")}`;
    }

    if (urlObject.hash) {
      encodedUrl.hash =
        "#" + encodeURIComponent(decodeURIComponent(urlObject.hash.slice(1)));
    }

    return {
      isValid: true,
      url: encodedUrl.toString(),
      originalUrl: sanitizedUrl,
    };
  } catch (error) {
    return {
      isValid: false,
      error: "Invalid URL format. Please check the URL",
    };
  }
}
