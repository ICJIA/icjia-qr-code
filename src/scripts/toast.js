// Accessible toast notifications. Messages are inserted with textContent only.
const ICONS = { error: "❌ ", success: "✅ ", info: "ℹ️ ", warning: "⚠️ " };
const LABELS = {
  error: "Error",
  success: "Success",
  info: "Information",
  warning: "Warning",
};

export function showToast(message, type = "info", duration = 3000) {
  const container = document.querySelector(".toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", type === "error" ? "assertive" : "polite");

  const icon = document.createElement("span");
  icon.className = "toast-icon";
  icon.setAttribute("aria-hidden", "true");
  if (ICONS[type]) {
    icon.textContent = ICONS[type];
    toast.setAttribute("aria-label", `${LABELS[type]}: ${message}`);
  }

  const msg = document.createElement("div");
  msg.className = "toast-message";
  if (message.includes("\n")) {
    message.split("\n").forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line.trim();
      msg.appendChild(p);
    });
  } else {
    msg.textContent = message;
  }

  toast.append(icon, msg);
  container.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 50);
  setTimeout(() => {
    if (toast.parentNode === container) {
      toast.classList.remove("show");
      setTimeout(() => {
        if (toast.parentNode === container) container.removeChild(toast);
      }, 300);
    }
  }, duration);
}
