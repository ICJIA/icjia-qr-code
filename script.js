document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 App initialization started");

  // Check for required browser features
  const requiredFeatures = {
    "Clipboard API": "clipboard" in navigator,
    "Blob API": "Blob" in window,
    "Local Storage": "localStorage" in window,
    "URL API": "URL" in window,
  };

  const missingFeatures = Object.entries(requiredFeatures)
    .filter(([_, supported]) => !supported)
    .map(([feature]) => feature);

  if (missingFeatures.length > 0) {
    console.warn("⚠️ Missing browser features:", missingFeatures);
    showToast(
      `Your browser is missing required features: ${missingFeatures.join(
        ", "
      )}`,
      "error"
    );
    document.getElementById("generate-btn").disabled = true;
  } else {
    console.log("✅ All required browser features are available");
  }

  // Theme handling
  const themeSwitch = document.getElementById("theme-switch");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Check for saved theme preference or use system preference
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme) {
    document.documentElement.setAttribute("data-theme", currentTheme);
    themeSwitch.checked = currentTheme === "dark";
  } else if (prefersDarkScheme.matches) {
    document.documentElement.setAttribute("data-theme", "dark");
    themeSwitch.checked = true;
  }

  // Theme switch event listener
  themeSwitch.addEventListener("change", function () {
    const newTheme = this.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });

  // QR Code generation
  const urlInput = document.querySelector("#url-input");
  const generateBtn = document.querySelector("#generate-btn");
  const qrcodeDiv = document.querySelector("#qrcode");
  const qrcodeContainer = document.querySelector(".qr-container");
  const urlDisplay = document.querySelector("#url-display");
  const copyBtn = document.querySelector("#copy-btn");
  const downloadBtn = document.querySelector("#download-btn");
  const resetBtn = document.querySelector("#reset-btn");
  const formatSelect = document.querySelector("#format-select");

  let qr = null;

  // URL validation and sanitization
  function sanitizeAndValidateURL(input) {
    console.log("🔍 Validating URL:", input);
    try {
      // Trim whitespace
      const sanitizedUrl = input.trim();

      // Require URL to start with http:// or https://
      if (!/^https?:\/\//i.test(sanitizedUrl)) {
        console.warn("❌ URL validation failed: Missing http(s) protocol");
        return {
          isValid: false,
          error: "URL must start with 'http://' or 'https://'",
        };
      }

      // Parse and validate URL structure
      const urlObject = new URL(sanitizedUrl);

      // Ensure only http or https protocols are allowed
      if (!["http:", "https:"].includes(urlObject.protocol)) {
        console.warn(
          "❌ URL validation failed: Invalid protocol",
          urlObject.protocol
        );
        return {
          isValid: false,
          error: "Only HTTP and HTTPS protocols are allowed",
        };
      }

      // Check for valid hostname (must have at least one dot and valid TLD)
      const hostname = urlObject.hostname;
      if (!hostname.includes(".") || !/\.[a-z]{2,}$/i.test(hostname)) {
        console.warn(
          "❌ URL validation failed: Invalid hostname format",
          hostname
        );
        return {
          isValid: false,
          error: "Invalid domain format. Please check the URL",
        };
      }

      // Properly encode the URL components while preserving the URL structure
      const encodedUrl = new URL(sanitizedUrl);
      const originalPathname = encodedUrl.pathname;

      // Encode the pathname (handles spaces and special characters in the path)
      encodedUrl.pathname = encodedUrl.pathname
        .split("/")
        .map((segment) =>
          segment ? encodeURIComponent(decodeURIComponent(segment)) : ""
        )
        .join("/");

      // Log if pathname was modified
      if (originalPathname !== encodedUrl.pathname) {
        console.log("🔄 URL pathname encoded:", {
          original: originalPathname,
          encoded: encodedUrl.pathname,
        });
      }

      // Preserve any query parameters and hash, but ensure they're properly encoded
      if (urlObject.search) {
        encodedUrl.search = urlObject.search;
        console.log("📝 URL includes query parameters:", urlObject.search);
      }
      if (urlObject.hash) {
        encodedUrl.hash = urlObject.hash;
        console.log("📝 URL includes hash:", urlObject.hash);
      }

      const result = {
        isValid: true,
        url: encodedUrl.toString(),
        originalUrl: sanitizedUrl,
      };

      if (result.url !== result.originalUrl) {
        console.log("🔄 URL encoding changes detected:", {
          original: result.originalUrl,
          encoded: result.url,
        });
      } else {
        console.log("✅ URL validation passed with no encoding needed");
      }

      return result;
    } catch (error) {
      console.error("❌ URL validation error:", error);
      return {
        isValid: false,
        error:
          "Invalid URL format. URL must be complete with protocol (e.g., https://example.com)",
      };
    }
  }

  // Add input event listener to reset everything when user starts typing
  urlInput.addEventListener("input", () => {
    console.log("📝 User started typing - resetting app state");
    // Reset QR code container
    qrcodeDiv.innerHTML = "";
    qrcodeContainer.classList.add("hidden");

    // Reset URL display
    urlDisplay.textContent = "";
    urlDisplay.href = "#";

    // Hide encoding information
    const encodingInfoDiv = document.querySelector(".encoding-info");
    encodingInfoDiv.classList.add("hidden");
    encodingInfoDiv.innerHTML = "";

    // Hide encoding confirmation
    const encodingConfirmDiv = document.querySelector(".encoding-confirm");
    encodingConfirmDiv.classList.add("hidden");
    encodingConfirmDiv.innerHTML = "";

    // Reset any error states or messages
    urlInput.classList.remove("error");
    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach((msg) => msg.remove());

    // Re-enable and reset generate button to default state
    generateBtn.disabled = false;
    generateBtn.style.opacity = "1";
    generateBtn.title = "";
    generateBtn.classList.remove("loading");

    // Reset QR code instance
    qr = null;

    // Clear any existing toasts
    const toastContainer = document.querySelector(".toast-container");
    toastContainer.innerHTML = "";
  });

  // Generate QR Code
  generateBtn.addEventListener("click", async function () {
    console.log("🎯 Generate button clicked");
    const url = urlInput.value;
    if (!url) {
      console.warn("❌ No URL provided");
      showToast("Please enter a URL", "error");
      return;
    }

    const validationResult = sanitizeAndValidateURL(url);
    if (!validationResult.isValid) {
      console.warn("❌ URL validation failed:", validationResult.error);
      showToast(validationResult.error, "error");
      return;
    }

    // Clear previous QR code and related content
    qrcodeDiv.innerHTML = "";
    qrcodeContainer.classList.add("hidden");

    // Check if URL needs encoding
    if (validationResult.url !== validationResult.originalUrl) {
      // Analyze what specific changes were made
      const changes = [];

      // Check for spaces
      if (validationResult.originalUrl.includes(" ")) {
        changes.push('Spaces were found and converted to "%20"');
      }

      // Check for non-ASCII characters (like é, ñ, etc.)
      const nonAsciiMatches =
        validationResult.originalUrl.match(/[^\x00-\x7F]/g);
      if (nonAsciiMatches) {
        const uniqueChars = [...new Set(nonAsciiMatches)];
        uniqueChars.forEach((char) => {
          const encoded = encodeURIComponent(char);
          changes.push(
            `Special character "${char}" was converted to "${encoded}"`
          );
        });
      }

      // Check for specific symbols that commonly need encoding
      const symbolChecks = {
        "+": "%2B",
        "&": "%26",
        "?": "%3F",
        "#": "%23",
        "=": "%3D",
        "%": "%25",
      };

      Object.entries(symbolChecks).forEach(([symbol, encoded]) => {
        if (validationResult.originalUrl.includes(symbol)) {
          changes.push(`Symbol "${symbol}" was converted to "${encoded}"`);
        }
      });

      // If we have actual encoding changes, show confirmation dialog
      if (changes.length > 0) {
        const encodingConfirmDiv = document.querySelector(".encoding-confirm");
        encodingConfirmDiv.innerHTML = `
          <div class="encoding-details">
            <h3>Your URL Needs to be Modified</h3>
            <div class="encoding-warning">
              ⚠️ Important: Your URL contains characters that need to be modified to work properly in QR codes.
              Please review the changes below and confirm if you want to proceed.
            </div>
            <div class="changes-list">
              <p><strong>Required changes to your URL:</strong></p>
              <ul>
                ${changes.map((change) => `<li>${change}</li>`).join("")}
              </ul>
            </div>
            <div class="url-comparison">
              <div class="url-item">
                <strong>Your Original URL:</strong>
                <span class="url-text">${validationResult.originalUrl}</span>
              </div>
              <div class="url-item">
                <strong>Modified URL:</strong>
                <a href="${
                  validationResult.url
                }" target="_blank" class="url-text">${validationResult.url}</a>
                <small>👆 Click to verify this modified URL works as expected</small>
              </div>
            </div>
            <div class="encoding-actions">
              <button id="approve-encoding" class="btn btn-primary">Generate QR Code with Modified URL</button>
              <button id="reject-encoding" class="btn btn-secondary">Cancel and Reset</button>
            </div>
          </div>
        `;
        encodingConfirmDiv.classList.remove("hidden");

        // Handle approval/rejection
        const approveBtn = document.getElementById("approve-encoding");
        const rejectBtn = document.getElementById("reject-encoding");

        // Return a promise that resolves when user makes a choice
        return new Promise((resolve, reject) => {
          approveBtn.addEventListener("click", async () => {
            encodingConfirmDiv.classList.add("hidden");
            encodingConfirmDiv.innerHTML = "";
            await generateQRCode(validationResult);
            resolve();
          });

          rejectBtn.addEventListener("click", () => {
            // Reset everything
            urlInput.value = "";
            qrcodeDiv.innerHTML = "";
            urlDisplay.textContent = "";
            urlDisplay.href = "#";
            qrcodeContainer.classList.add("hidden");
            encodingConfirmDiv.classList.add("hidden");
            encodingConfirmDiv.innerHTML = "";
            showToast("QR code generation cancelled", "info");
            resolve();
          });
        });
      }
    }

    // If no encoding needed or changes approved, generate QR code
    await generateQRCode(validationResult);
  });

  // Separate function for QR code generation
  async function generateQRCode(validationResult) {
    console.log(
      "🎨 Starting QR code generation for URL:",
      validationResult.url
    );
    try {
      // Show loading state
      generateBtn.classList.add("loading");
      generateBtn.disabled = true;

      // Display the encoded URL (not the original)
      urlDisplay.textContent = validationResult.url;
      urlDisplay.href = validationResult.url;

      // Generate new QR code with encoded URL
      qr = new QRCode(qrcodeDiv, {
        text: validationResult.url,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });

      console.log("✅ QR code generated successfully");
      // Show elements
      qrcodeContainer.classList.remove("hidden");
      showToast("QR Code generated successfully!", "success");

      // Keep generate button disabled after successful generation
      generateBtn.disabled = true;
      generateBtn.style.opacity = "0.6";
      generateBtn.title = "Please reset or refresh to generate a new QR code";
    } catch (e) {
      console.error("❌ QR Code generation error:", {
        error: e,
        message: e.message,
        stack: e.stack,
      });
      showToast("Failed to generate QR Code", "error");
      // Re-enable button on error
      generateBtn.disabled = false;
      generateBtn.style.opacity = "1";
    } finally {
      // Only remove loading state
      generateBtn.classList.remove("loading");
    }
  }

  // Copy QR Code to clipboard
  copyBtn.addEventListener("click", async function () {
    console.log("📋 Copy to clipboard requested");
    if (!qr) {
      console.warn("❌ Copy attempted without QR code");
      showToast("Please generate a QR code first", "error");
      return;
    }

    try {
      copyBtn.classList.add("loading");
      copyBtn.disabled = true;

      const canvas = qrcodeDiv.querySelector("canvas");
      const blob = await new Promise((resolve) => canvas.toBlob(resolve));

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);

      console.log("✅ QR code copied to clipboard successfully");
      showToast("QR Code copied to clipboard!", "success");
    } catch (err) {
      console.error("❌ Copy to clipboard failed:", {
        error: err,
        message: err.message,
        stack: err.stack,
      });
      showToast("Failed to copy QR Code", "error");
    } finally {
      copyBtn.classList.remove("loading");
      copyBtn.disabled = false;
    }
  });

  // Download QR Code
  downloadBtn.addEventListener("click", async function () {
    console.log("💾 Download requested");
    if (!qr) {
      console.warn("❌ Download attempted without QR code");
      showToast("Please generate a QR code first", "error");
      return;
    }

    try {
      downloadBtn.classList.add("loading");
      downloadBtn.disabled = true;

      const canvas = qrcodeDiv.querySelector("canvas");
      const format = document.getElementById("format-select").value;
      const url = urlDisplay.href;

      console.log("📦 Preparing download:", { format, url });

      // Create filename by removing protocol and special characters
      const cleanUrl = url
        .replace(/^(https?:\/\/)/, "")
        .replace(/\/$/, "")
        .replace(/[^\w.-]/g, "-")
        .replace(/--+/g, "-")
        .substring(0, 50);

      const filename = `qr-code-${cleanUrl}.${format}`;
      console.log("📄 Generated filename:", filename);

      if (format === "svg") {
        console.log("🎨 Generating SVG format");
        const svgData = await generateSVG();
        const blob = new Blob([svgData], { type: "image/svg+xml" });
        saveAs(blob, filename);
      } else {
        console.log(`🎨 Converting to ${format.toUpperCase()} format`);
        const mimeType = `image/${format}`;
        const quality = format === "jpg" ? 0.9 : undefined;

        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, mimeType, quality)
        );
        saveAs(blob, filename);
      }

      console.log("✅ Download completed successfully");
      showToast(`QR Code downloaded as ${format.toUpperCase()}`, "success");
    } catch (err) {
      console.error("❌ Download failed:", {
        error: err,
        message: err.message,
        stack: err.stack,
      });
      showToast("Failed to download QR Code", "error");
    } finally {
      downloadBtn.classList.remove("loading");
      downloadBtn.disabled = false;
    }
  });

  // Generate SVG representation of the QR code
  async function generateSVG() {
    const canvas = document.querySelector("#qrcode canvas");
    const size = canvas.width;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const alpha = data[idx + 3];

        if (alpha > 0) {
          svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="black"/>`;
        }
      }
    }

    svg += "</svg>";
    return svg;
  }

  // Reset form
  resetBtn.addEventListener("click", function () {
    console.log("🔄 Reset requested - clearing all data");
    urlInput.value = "";
    qrcodeDiv.innerHTML = "";
    urlDisplay.textContent = "";
    urlDisplay.href = "#";
    document.querySelector(".qr-container").classList.add("hidden");
    qr = null;
    // Re-enable generate button
    generateBtn.disabled = false;
    generateBtn.style.opacity = "1";
    generateBtn.title = "";
    showToast("Form reset", "info");
  });

  // Handle Enter key in URL input
  urlInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      generateBtn.click();
    }
  });

  // Toast notification function
  function showToast(message, type, duration = 3000) {
    const toastContainer = document.querySelector(".toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    // Handle multiline messages
    if (message.includes("\n")) {
      message.split("\n").forEach((line) => {
        const p = document.createElement("p");
        p.textContent = line.trim();
        toast.appendChild(p);
      });
    } else {
      toast.textContent = message;
    }

    toast.setAttribute("role", "alert");

    // Add the toast to the container
    toastContainer.appendChild(toast);

    // Show the toast (with slight delay for animation)
    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    // Set up removal of toast
    const removeToast = () => {
      // Only proceed if toast is still in the DOM
      if (toast.parentNode === toastContainer) {
        toast.classList.remove("show");

        // Wait for fade out animation before removing
        setTimeout(() => {
          // Double check if toast is still in container before removing
          if (toast.parentNode === toastContainer) {
            toastContainer.removeChild(toast);
          }
        }, 300);
      }
    };

    // Schedule the toast removal
    setTimeout(removeToast, duration);
  }

  // Error handling for unhandled promise rejections
  window.addEventListener("unhandledrejection", function (event) {
    console.error("❌ Unhandled promise rejection:", {
      reason: event.reason,
      message: event.reason?.message,
      stack: event.reason?.stack,
    });
    showToast(
      `An unexpected error occurred: ${
        event.reason?.message || "Unknown error"
      }`,
      "error"
    );
  });

  // Error handling for unexpected errors
  window.addEventListener("error", function (event) {
    console.error("❌ Global error:", {
      error: event.error,
      message: event.error?.message,
      stack: event.error?.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
    showToast(
      `An unexpected error occurred: ${
        event.error?.message || "Unknown error"
      }`,
      "error"
    );
  });

  console.log("✅ App initialization completed");
});
