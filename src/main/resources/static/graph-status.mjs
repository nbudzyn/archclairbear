export function createGraphStatusController({
  statusElement,
  statusMessageElement,
  errorElement,
  errorMessageElement,
}) {
  return {
    hideStatus() {
      statusElement.hidden = true;
      errorElement.hidden = true;
    },
    showError(message) {
      statusElement.hidden = true;
      errorMessageElement.textContent = message;
      errorElement.hidden = false;
    },
    showLoading(message) {
      errorElement.hidden = true;
      statusMessageElement.textContent = message;
      statusElement.hidden = false;
    },
  };
}
