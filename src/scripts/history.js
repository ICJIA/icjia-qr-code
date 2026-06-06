// QR code history: localStorage persistence + accessible modal UI.
// Rows are built with DOM nodes/textContent (never innerHTML of user URLs).
import { showToast } from "./toast.js";

const STORAGE_KEY = "qrCodeHistory";
const MAX_ITEMS = 50;

export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory({ originalUrl, url }) {
  const history = getHistory();
  history.unshift({
    timestamp: new Date().toISOString(),
    originalUrl,
    encodedUrl: url,
  });
  if (history.length > MAX_ITEMS) history.length = MAX_ITEMS;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    /* storage full/unavailable — history is best-effort */
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString();
}

function renderRows(tbody, onPick) {
  tbody.replaceChildren();
  const history = getHistory();

  if (history.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.className = "history-empty";
    td.textContent = "No QR codes generated yet";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  history.forEach((item) => {
    const tr = document.createElement("tr");

    const dateTd = document.createElement("td");
    dateTd.textContent = formatDateTime(item.timestamp);

    const origTd = document.createElement("td");
    origTd.className = "history-url";
    origTd.textContent = item.originalUrl;

    const encTd = document.createElement("td");
    encTd.className = "history-url";
    const link = document.createElement("a");
    link.href = item.encodedUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = item.encodedUrl;
    encTd.appendChild(link);

    const actionTd = document.createElement("td");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "generate-icon";
    btn.setAttribute("aria-label", "Generate QR code for this URL");
    btn.textContent = "↻";
    actionTd.appendChild(btn);

    tr.append(dateTd, origTd, encTd, actionTd);

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      onPick(item);
    });
    tr.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      onPick(item);
    });

    tbody.appendChild(tr);
  });
}

function showDeleteConfirmation(onConfirmed) {
  const backdrop = document.createElement("div");
  backdrop.className = "confirmation-backdrop";

  const dialog = document.createElement("div");
  dialog.className = "confirmation-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "confirm-title");

  const h3 = document.createElement("h3");
  h3.id = "confirm-title";
  h3.textContent = "Delete History";

  const p = document.createElement("p");
  p.textContent =
    "Are you sure you want to delete all your QR code history? This action cannot be undone.";

  const buttons = document.createElement("div");
  buttons.className = "dialog-buttons";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "btn btn-secondary";
  cancelBtn.textContent = "No, Cancel";

  const confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.className = "btn btn-danger";
  confirmBtn.textContent = "Yes, Delete All";

  buttons.append(cancelBtn, confirmBtn);
  dialog.append(h3, p, buttons);
  backdrop.appendChild(dialog);
  document.body.appendChild(backdrop);

  const close = () => {
    backdrop.remove();
    document.removeEventListener("keydown", onKeydown);
  };

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      const focusable = [cancelBtn, confirmBtn];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  cancelBtn.addEventListener("click", close);
  confirmBtn.addEventListener("click", () => {
    onConfirmed();
    close();
  });
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  document.addEventListener("keydown", onKeydown);

  cancelBtn.focus();
}

/**
 * Wire up the history modal.
 * @param {{ openBtn: HTMLElement, modal: HTMLElement, tbody: HTMLElement,
 *           closeBtn: HTMLElement, deleteBtn: HTMLElement,
 *           onPick: (item: {originalUrl: string, encodedUrl: string}) => void }} els
 */
export function initHistoryUI({ openBtn, modal, tbody, closeBtn, deleteBtn, onPick }) {
  const open = () => {
    renderRows(tbody, (item) => {
      hide();
      onPick(item);
    });
    modal.classList.remove("hidden");
  };
  const hide = () => modal.classList.add("hidden");

  if (openBtn) openBtn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", hide);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) hide();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) hide();
  });

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      showDeleteConfirmation(() => {
        clearHistory();
        renderRows(tbody, (item) => {
          hide();
          onPick(item);
        });
        showToast("History deleted successfully", "success");
      });
    });
  }
}
