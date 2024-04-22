// Errors
export function parseErrorObject(err, defaultMessage = "") {
  if (typeof err === "string") return err;
  else if (typeof err === "object" && err.message) return err.message;
  else return defaultMessage;
}

export function parseApiError(err) {
  let message = "Server internal error";
  if (err.error) message = err.error;
  else if (err.response?.data?.error) message = err.response.data.error;
  // console.log(`get error message: ${message}`);
  return message;
}

export function dateFromTimestamp(time) {
  return new Date(time).toLocaleString("ru", {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}

export function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).catch((err) => {
    console.error("Failed copy text to clipboard: ", err);
  });
}
