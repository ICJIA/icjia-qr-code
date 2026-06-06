// URL-change confirmation dialogs, built entirely with DOM nodes/textContent.
const SYMBOLS = {
  "+": "%2B",
  "&": "%26",
  "?": "%3F",
  "#": "%23",
  "=": "%3D",
  "%": "%25",
};

function describeChanges(originalUrl) {
  const changes = [];
  if (originalUrl.includes(" "))
    changes.push('Spaces were converted to "%20".');

  const nonAscii = originalUrl.match(/[^\x00-\x7F]/g);
  if (nonAscii) {
    [...new Set(nonAscii)].forEach((ch) => {
      changes.push(
        `Special character "${ch}" was converted to "${encodeURIComponent(ch)}".`,
      );
    });
  }
  Object.entries(SYMBOLS).forEach(([sym, enc]) => {
    if (originalUrl.includes(sym))
      changes.push(`Symbol "${sym}" was converted to "${enc}".`);
  });
  if (changes.length === 0) {
    changes.push("Your URL was normalized for QR code compatibility.");
  }
  return changes;
}

function urlComparison(originalUrl, modifiedUrl, modifiedAsLink) {
  const wrap = document.createElement("div");
  wrap.className = "url-comparison";

  const orig = document.createElement("div");
  orig.className = "url-item";
  const origLabel = document.createElement("strong");
  origLabel.textContent = "Your original URL:";
  const origText = document.createElement("span");
  origText.className = "url-text";
  origText.textContent = originalUrl;
  orig.append(origLabel, origText);

  const mod = document.createElement("div");
  mod.className = "url-item";
  const modLabel = document.createElement("strong");
  modLabel.textContent = "Modified URL:";
  const modText = modifiedAsLink
    ? document.createElement("a")
    : document.createElement("span");
  if (modifiedAsLink) {
    modText.href = modifiedUrl;
    modText.target = "_blank";
    modText.rel = "noopener noreferrer";
  }
  modText.className = "url-text";
  modText.textContent = modifiedUrl;
  mod.append(modLabel, modText);

  wrap.append(orig, mod);
  return wrap;
}

function actionRow(approveLabel, cancelLabel, onApprove, onCancel) {
  const wrap = document.createElement("div");
  wrap.className = "encoding-actions";

  const approve = document.createElement("button");
  approve.type = "button";
  approve.className = "btn btn-primary";
  approve.textContent = approveLabel;
  approve.addEventListener("click", () => {
    wrap.remove();
    onApprove();
  });

  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "btn btn-secondary";
  cancel.textContent = cancelLabel;
  cancel.addEventListener("click", onCancel);

  wrap.append(approve, cancel);
  return wrap;
}

export function showEncodingWarning(
  container,
  result,
  { onApprove, onCancel },
) {
  container.replaceChildren();
  container.classList.remove("hidden");

  const details = document.createElement("div");
  details.className = "encoding-details";

  const h3 = document.createElement("h3");
  h3.textContent = "Your URL needs to be modified";

  const warning = document.createElement("p");
  warning.className = "encoding-warning";
  warning.textContent =
    "Your URL contains characters that must be encoded to work in a QR code. Review the changes and confirm.";

  const list = document.createElement("ul");
  list.className = "changes-list";
  describeChanges(result.originalUrl).forEach((change) => {
    const li = document.createElement("li");
    li.textContent = change;
    list.appendChild(li);
  });

  details.append(
    h3,
    warning,
    list,
    urlComparison(result.originalUrl, result.url, true),
    actionRow(
      "Yes, generate with modified URL",
      "No, cancel",
      onApprove,
      onCancel,
    ),
  );
  container.appendChild(details);
}

export function showDoubleSlashWarning(
  container,
  result,
  { onApprove, onCancel },
) {
  container.replaceChildren();
  container.classList.remove("hidden");

  const details = document.createElement("div");
  details.className = "encoding-details";

  const h3 = document.createElement("h3");
  h3.textContent = "URL format warning";

  const warning = document.createElement("p");
  warning.className = "encoding-warning";
  warning.textContent =
    "Your URL contains a double trailing slash, which is usually incorrect. We can fix it for you.";

  details.append(
    h3,
    warning,
    urlComparison(result.originalUrl, result.suggestedUrl, false),
    actionRow("Use corrected URL", "Cancel", onApprove, onCancel),
  );
  container.appendChild(details);
}
