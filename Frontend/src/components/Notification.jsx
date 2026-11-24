export default function Notification({ notification, onClose }) {
  if (!notification) {
    return null;
  }

  const isError = notification.type === 'error';

  return (
    <div
      className={`notification notification--${notification.type}`}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
    >
      <p>{notification.message}</p>
      <button type="button" onClick={onClose} aria-label="Cerrar notificación">
        ×
      </button>
    </div>
  );
}
