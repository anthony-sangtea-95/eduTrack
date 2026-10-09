const TRANSITION_MS = 220;
const DEFAULT_DURATION_MS = 4000;
const CONTAINER_ID = 'edu-track-notifications';

const alertStyles = {
  success: { icon: '✓', label: 'Success', color: '#187653', background: '#eaf7f2' },
  error: { icon: '!', label: 'Error', color: '#b4232e', background: '#fff0f0' },
  warning: { icon: '!', label: 'Warning', color: '#a45c09', background: '#fff5e8' },
  info: { icon: 'i', label: 'Information', color: 'var(--accent, #3157c8)', background: 'var(--accent-soft, #edf2ff)' },
};

function getContainer() {
  let container = document.getElementById(CONTAINER_ID);
  if (container) return container;

  container = document.createElement('div');
  container.id = CONTAINER_ID;
  container.setAttribute('aria-label', 'Notifications');
  container.style.position = 'fixed';
  container.style.top = '16px';
  container.style.right = '16px';
  container.style.zIndex = '10000';
  container.style.display = 'grid';
  container.style.gap = '10px';
  container.style.width = 'min(400px, calc(100vw - 32px))';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);
  return container;
}

function _createAlert(type, message, duration = DEFAULT_DURATION_MS) {
  const container = getContainer();
  const style = alertStyles[type] || alertStyles.info;
  const alertEl = document.createElement('div');
  const icon = document.createElement('span');
  const content = document.createElement('div');
  const title = document.createElement('strong');
  const description = document.createElement('span');
  const closeButton = document.createElement('button');
  let hideTimer;

  alertEl.setAttribute('role', type === 'error' ? 'alert' : 'status');
  alertEl.setAttribute('aria-atomic', 'true');
  alertEl.style.display = 'grid';
  alertEl.style.gridTemplateColumns = '36px minmax(0, 1fr) 28px';
  alertEl.style.alignItems = 'start';
  alertEl.style.gap = '12px';
  alertEl.style.padding = '15px 14px';
  alertEl.style.border = '1px solid #e5eaf2';
  alertEl.style.borderLeft = `4px solid ${style.color}`;
  alertEl.style.borderRadius = '12px';
  alertEl.style.background = '#fff';
  alertEl.style.color = '#172033';
  alertEl.style.boxShadow = '0 12px 32px rgba(26, 43, 77, 0.16)';
  alertEl.style.fontFamily = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  alertEl.style.opacity = '0';
  alertEl.style.transform = 'translateY(-8px)';
  alertEl.style.transition = `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`;
  alertEl.style.pointerEvents = 'auto';

  icon.textContent = style.icon;
  icon.setAttribute('aria-hidden', 'true');
  icon.style.display = 'grid';
  icon.style.width = '34px';
  icon.style.height = '34px';
  icon.style.placeItems = 'center';
  icon.style.borderRadius = '10px';
  icon.style.background = style.background;
  icon.style.color = style.color;
  icon.style.fontSize = '15px';
  icon.style.fontWeight = '750';

  content.style.display = 'grid';
  content.style.gap = '3px';
  content.style.minWidth = '0';

  title.textContent = style.label;
  title.style.color = '#202d43';
  title.style.fontSize = '13px';
  title.style.fontWeight = '700';
  title.style.lineHeight = '1.4';

  description.textContent = String(message ?? '');
  description.style.color = '#566176';
  description.style.fontSize = '13px';
  description.style.lineHeight = '1.5';
  description.style.overflowWrap = 'anywhere';

  closeButton.type = 'button';
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', `Dismiss ${style.label.toLowerCase()} notification`);
  closeButton.style.display = 'grid';
  closeButton.style.width = '28px';
  closeButton.style.height = '28px';
  closeButton.style.margin = '-4px -3px 0 0';
  closeButton.style.placeItems = 'center';
  closeButton.style.border = '0';
  closeButton.style.borderRadius = '7px';
  closeButton.style.background = 'transparent';
  closeButton.style.color = '#7a8799';
  closeButton.style.fontSize = '21px';
  closeButton.style.lineHeight = '1';
  closeButton.style.cursor = 'pointer';

  content.append(title, description);
  alertEl.append(icon, content, closeButton);

  const dismiss = () => {
    if (!alertEl.isConnected || alertEl.dataset.dismissing) return;
    alertEl.dataset.dismissing = 'true';
    clearTimeout(hideTimer);
    alertEl.style.opacity = '0';
    alertEl.style.transform = 'translateY(-8px)';
    setTimeout(() => {
      alertEl.remove();
      if (container.childElementCount === 0) container.remove();
    }, TRANSITION_MS);
  };

  closeButton.addEventListener('click', dismiss);
  alertEl.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  alertEl.addEventListener('mouseleave', () => {
    if (!alertEl.dataset.dismissing) hideTimer = setTimeout(dismiss, 1200);
  });
  alertEl.addEventListener('focusin', () => clearTimeout(hideTimer));
  alertEl.addEventListener('focusout', () => {
    if (!alertEl.contains(document.activeElement) && !alertEl.dataset.dismissing) {
      hideTimer = setTimeout(dismiss, 1200);
    }
  });

  container.appendChild(alertEl);
  requestAnimationFrame(() => {
    alertEl.style.opacity = '1';
    alertEl.style.transform = 'translateY(0)';
  });

  const timeout = Number(duration);
  hideTimer = setTimeout(dismiss, Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_DURATION_MS);
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
