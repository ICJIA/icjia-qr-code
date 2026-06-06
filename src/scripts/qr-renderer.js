// qr-code-styling is loaded on first use via dynamic import, so it stays out of
// the initial island bundle (smaller first load, no render-blocking from it).
let qrLibPromise;
function loadQrLib() {
  if (!qrLibPromise) {
    qrLibPromise = import("qr-code-styling").then((m) => m.default);
  }
  return qrLibPromise;
}

// QR codes render dark-on-light regardless of page theme, for scannability.
export const SIZE = 320;

// qr-code-styling's FileExtension is "svg" | "png" | "jpeg" | "webp".
// The download UI offers "jpg", so map it to "jpeg".
const EXT = { png: "png", jpg: "jpeg", jpeg: "jpeg", webp: "webp", svg: "svg" };

/**
 * Translate a UI download format to a qr-code-styling file extension.
 * @param {string} format
 * @returns {"png"|"jpeg"|"webp"|"svg"}
 */
export function fileExtension(format) {
  return EXT[format] || "png";
}

/**
 * Build a configured QRCodeStyling instance (loads the library on first call).
 * Level H error correction tolerates the optional center badge.
 * @param {{ data: string, image?: string }} opts
 * @returns {Promise<import("qr-code-styling").default>}
 */
export async function createQr({ data, image }) {
  const QRCodeStyling = await loadQrLib();
  return new QRCodeStyling({
    type: "canvas",
    width: SIZE,
    height: SIZE,
    margin: 8,
    data,
    image: image || undefined,
    qrOptions: { errorCorrectionLevel: "H" },
    imageOptions: {
      crossOrigin: "anonymous",
      hideBackgroundDots: true,
      imageSize: 0.2,
      margin: 4,
    },
    dotsOptions: { type: "square", color: "#000000" },
    cornersSquareOptions: { type: "square", color: "#000000" },
    cornersDotOptions: { type: "square", color: "#000000" },
    backgroundOptions: { color: "#ffffff" },
  });
}

/**
 * Get the QR code as a Blob in the requested format.
 * @param {import("qr-code-styling").default} qr
 * @param {string} format
 * @returns {Promise<Blob|null>}
 */
export async function getBlob(qr, format) {
  return qr.getRawData(fileExtension(format));
}
