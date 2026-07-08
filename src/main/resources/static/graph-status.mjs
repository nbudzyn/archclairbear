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
    showStatus(message) {
      errorElement.hidden = true;
      statusMessageElement.textContent = message;
      statusElement.hidden = false;
    },
    showError(message) {
      statusElement.hidden = true;
      errorMessageElement.textContent = message;
      errorElement.hidden = false;
    },
    showLoading(message) {
      this.showStatus(message);
    },
  };
}
