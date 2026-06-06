import logoImage from "../assets/icjia-badge.png";

// Astro resolves a src/ image import to an ImageMetadata object ({ src, width, height });
// qr-code-styling needs the plain URL string.
const logoUrl = logoImage?.src ?? logoImage;

const STORAGE_KEY = "logoEnabled";

export function restoreLogoPref(checkboxEl) {
  if (!checkboxEl) return;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) checkboxEl.checked = saved === "true";
  } catch {
    /* storage unavailable — keep markup default */
  }
}

export function persistLogoPref(checkboxEl) {
  try {
    localStorage.setItem(STORAGE_KEY, String(Boolean(checkboxEl && checkboxEl.checked)));
  } catch {
    /* ignore */
  }
}

export function logoAssetAvailable() {
  return Boolean(logoUrl);
}

export function getLogoImage(checkboxEl) {
  return checkboxEl && checkboxEl.checked && logoUrl ? logoUrl : undefined;
}
