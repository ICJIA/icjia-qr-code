export function sanitizeAndValidateURL(input) {
  try {
    const sanitizedUrl = input.trim();

    // Require URL to start with http:// or https://
    if (!/^https?:\/\//i.test(sanitizedUrl)) {
      return {
        isValid: false,
        error: "URL must start with 'http://' or 'https://'",
      };
    }

    // Parse URL to validate structure
    const urlObject = new URL(sanitizedUrl);

    // Ensure only http or https protocols are allowed
    if (!["http:", "https:"].includes(urlObject.protocol)) {
      return {
        isValid: false,
        error: "Only HTTP and HTTPS protocols are allowed",
      };
    }

    // Check for valid hostname (must have at least one dot and valid TLD)
    const hostname = urlObject.hostname;
    const validTLDs = ["com", "org", "net", "edu", "gov"];
    const tld = hostname.split(".").pop();

    if (!hostname.includes(".") || !validTLDs.includes(tld)) {
      return {
        isValid: false,
        error: "Invalid domain format or TLD. Please check the URL",
      };
    }

    // Create encoded version
    const encodedUrl = new URL(sanitizedUrl);
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
    if (
      urlObject.search &&
      urlObject.search.slice(1) !==
        encodeURIComponent(urlObject.search.slice(1))
    ) {
      needsEncoding = true;
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
        url: sanitizedUrl,
        originalUrl: sanitizedUrl,
      };
    }

    // Encode URL parts
    encodedUrl.pathname = pathParts
      .map((part) => (part ? encodeURIComponent(decodeURIComponent(part)) : ""))
      .join("/");

    if (urlObject.search) {
      encodedUrl.search =
        "?" + encodeURIComponent(decodeURIComponent(urlObject.search.slice(1)));
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
