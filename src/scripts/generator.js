import { sanitizeAndValidateURL } from "./url-validator.js";
import { createQr, getBlob, fileExtension } from "./qr-renderer.js";
import { showToast } from "./toast.js";
import { restoreLogoPref, persistLogoPref, getLogoImage } from "./logo.js";
import { addToHistory, initHistoryUI } from "./history.js";
import { showEncodingWarning, showDoubleSlashWarning } from "./dialogs.js";

function ready(fn) {
  if (document.readyState !== "loading") fn();
  else document.addEventListener("DOMContentLoaded", fn);
}

ready(() => {
  const urlInput = document.querySelector("#url-input");
  const generateBtn = document.querySelector("#generate-btn");
  const qrcodeDiv = document.querySelector("#qrcode");
  const qrContainer = document.querySelector(".qr-container");
  const urlDisplay = document.querySelector("#url-display");
  const copyBtn = document.querySelector("#copy-btn");
  const downloadBtn = document.querySelector("#download-btn");
  const resetBtn = document.querySelector("#reset-btn");
  const formatSelect = document.querySelector("#format-select");
  const encodingConfirm = document.querySelector(".encoding-confirm");
  const testWarning = document.querySelector(".test-warning");
  const bestPractices = document.querySelector(".best-practices");
  const logoToggle = document.querySelector("#logo-toggle");

  if (!urlInput || !generateBtn || !qrcodeDiv || !qrContainer) return;

  let qr = null;
  let currentResult = null;

  // Required-feature detection
  const features = {
    "Clipboard API": "clipboard" in navigator,
    "Blob API": "Blob" in window,
    "Local Storage": "localStorage" in window,
    "URL API": "URL" in window,
  };
  const missing = Object.entries(features)
    .filter(([, ok]) => !ok)
    .map(([name]) => name);
  if (missing.length) {
    showToast(
      `Your browser is missing required features: ${missing.join(", ")}`,
      "error",
    );
    generateBtn.disabled = true;
  }

  restoreLogoPref(logoToggle);

  initHistoryUI({
    openBtn: document.querySelector("#history-btn"),
    modal: document.querySelector("#history-modal"),
    tbody: document.querySelector("#history-table-body"),
    closeBtn: document.querySelector("#history-modal .close-modal"),
    deleteBtn: document.querySelector("#delete-history-btn"),
    onPick: (item) => {
      resetView();
      urlInput.value = item.encodedUrl;
      render({
        isValid: true,
        url: item.encodedUrl,
        originalUrl: item.originalUrl,
      });
    },
  });

  function hideExtras() {
    testWarning?.classList.add("hidden");
    bestPractices?.classList.add("hidden");
    if (encodingConfirm) {
      encodingConfirm.classList.add("hidden");
      encodingConfirm.replaceChildren();
    }
  }

  function resetView() {
    qrcodeDiv.replaceChildren();
    qrContainer.classList.add("hidden");
    urlDisplay.textContent = "";
    urlDisplay.removeAttribute("href");
    hideExtras();
    qr = null;
    currentResult = null;
  }

  function dataFrom(result) {
    return result.url || result.suggestedUrl || result.originalUrl;
  }

  async function render(result) {
    currentResult = result;
    const data = dataFrom(result);

    qrcodeDiv.replaceChildren();
    try {
      qr = await createQr({ data, image: getLogoImage(logoToggle) });
      qr.append(qrcodeDiv);
    } catch {
      showToast("Failed to generate QR Code", "error");
      return;
    }
    qrcodeDiv.setAttribute(
      "aria-label",
      `QR code for ${data}. Scan with a mobile device to open this URL.`,
    );

    qrContainer.classList.remove("hidden");
    urlDisplay.textContent = data;
    urlDisplay.href = data;
    testWarning?.classList.remove("hidden");
    bestPractices?.classList.remove("hidden");
    if (encodingConfirm) {
      encodingConfirm.classList.add("hidden");
      encodingConfirm.replaceChildren();
    }

    addToHistory({ originalUrl: result.originalUrl || data, url: data });
    showToast(
      "QR Code generated. Please test it with a mobile device.",
      "success",
      5000,
    );
  }

  generateBtn.addEventListener("click", () => {
    const value = urlInput.value;
    if (!value) {
      showToast("Please enter a URL", "error");
      return;
    }
    const result = sanitizeAndValidateURL(value);
    if (!result.isValid) {
      showToast(result.error, "error");
      return;
    }
    if (result.warning === "Double trailing slash detected") {
      showDoubleSlashWarning(encodingConfirm, result, {
        onApprove: () =>
          render({
            isValid: true,
            url: result.suggestedUrl,
            originalUrl: result.originalUrl,
          }),
        onCancel: () => {
          resetView();
          showToast("QR code generation cancelled", "info");
        },
      });
      return;
    }
    if (result.hasWarnings && result.url !== result.originalUrl) {
      showEncodingWarning(encodingConfirm, result, {
        onApprove: () => render(result),
        onCancel: () => {
          resetView();
          showToast("QR code generation cancelled", "info");
        },
      });
      return;
    }
    render(result);
  });

  urlInput.addEventListener("input", () => {
    const dialogOpen =
      encodingConfirm && !encodingConfirm.classList.contains("hidden");
    if (!qrContainer.classList.contains("hidden") || dialogOpen) resetView();
  });

  urlInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") generateBtn.click();
  });

  logoToggle?.addEventListener("change", async () => {
    persistLogoPref(logoToggle);
    if (currentResult) {
      const data = dataFrom(currentResult);
      qrcodeDiv.replaceChildren();
      qr = await createQr({ data, image: getLogoImage(logoToggle) });
      qr.append(qrcodeDiv);
    }
  });

  copyBtn?.addEventListener("click", async () => {
    if (!qr) {
      showToast("Please generate a QR code first", "error");
      return;
    }
    try {
      copyBtn.classList.add("loading");
      const blob = await getBlob(qr, "png");
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      showToast("QR Code copied to clipboard!", "success");
    } catch {
      showToast("Failed to copy QR Code", "error");
    } finally {
      copyBtn.classList.remove("loading");
    }
  });

  downloadBtn?.addEventListener("click", async () => {
    if (!qr) {
      showToast("Please generate a QR code first", "error");
      return;
    }
    const format = formatSelect.value;
    try {
      downloadBtn.classList.add("loading");
      const source = urlDisplay.href || "qr-code";
      const name =
        "qr-code-" +
        source
          .replace(/^https?:\/\//, "")
          .replace(/[^\w.-]/g, "-")
          .replace(/-+/g, "-")
          .substring(0, 50);
      await qr.download({ name, extension: fileExtension(format) });
      showToast(`QR Code downloaded as ${format.toUpperCase()}`, "success");
    } catch {
      showToast("Failed to download QR Code", "error");
    } finally {
      downloadBtn.classList.remove("loading");
    }
  });

  resetBtn?.addEventListener("click", () => {
    urlInput.value = "";
    resetView();
    showToast("Form reset", "info");
  });

  // Deep link: ?url=... pre-fills the input and generates immediately,
  // so a shared link reproduces the same QR code.
  const deepUrl = new URLSearchParams(location.search).get("url");
  if (deepUrl) {
    urlInput.value = deepUrl;
    generateBtn.click();
  }

  window.addEventListener("unhandledrejection", (e) => {
    showToast(
      `An unexpected error occurred: ${e.reason?.message || "Unknown error"}`,
      "error",
    );
  });
});
