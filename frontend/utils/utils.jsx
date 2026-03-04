// Utility functions for frontend

const TRANSITION_MS = 300;

// create a transient message element and remove after duration
function _createAlert(type, message, duration = 1500) {
  const alertEl = document.createElement('div');
  alertEl.className = `message-alert ${type}`;
  alertEl.textContent = message;
  // basic styling - adjust in CSS if needed
  alertEl.style.position = 'fixed';
  alertEl.style.top = '20px';
  alertEl.style.right = '20px';
  alertEl.style.padding = '10px 20px';
  alertEl.style.borderRadius = '4px';
  alertEl.style.color = '#fff';
  alertEl.style.zIndex = 9999;

  // start hidden for transition
  alertEl.style.opacity = '0';
  alertEl.style.transform = 'translateY(-10px)';
  alertEl.style.transition = `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`;

  switch (type) {
    case 'success':
      alertEl.style.backgroundColor = '#28a745';
      break;
    case 'error':
      alertEl.style.backgroundColor = '#dc3545';
      break;
    case 'warning':
      alertEl.style.backgroundColor = '#ffc107';
      alertEl.style.color = '#000';
      break;
    default:
      alertEl.style.backgroundColor = '#17a2b8';
  }

  document.body.appendChild(alertEl);

  // trigger enter transition
  requestAnimationFrame(() => {
    alertEl.style.opacity = '1';
    alertEl.style.transform = 'translateY(0)';
  });

  // hide after `duration`, then remove after transition completes
  const startHide = () => {
    alertEl.style.opacity = '0';
    alertEl.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      if (alertEl.parentNode) alertEl.parentNode.removeChild(alertEl);
    }, TRANSITION_MS);
  };

  setTimeout(startHide, duration);
}

export function showSuccess(message, duration) {
  _createAlert('success', message, duration);
}

export function showError(message, duration) {
  _createAlert('error', message, duration);
}

export function showWarning(message, duration) {
  _createAlert('warning', message, duration);
}
