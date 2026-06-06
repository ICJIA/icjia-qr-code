// The pre-paint script in BaseLayout already set <html data-theme>; this just
// syncs the toggle control to it and persists changes.
const STORAGE_KEY = "theme";

export function initThemeToggle(checkboxEl) {
  if (!checkboxEl) return;
  const current = document.documentElement.getAttribute("data-theme");
  checkboxEl.checked = current === "dark";

  checkboxEl.addEventListener("change", () => {
    const theme = checkboxEl.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  });
}
