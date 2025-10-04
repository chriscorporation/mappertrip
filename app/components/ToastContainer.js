'use client';

import { useToastStore } from '../store/toastStore';
import Toast from './Toast';

/**
 * Contenedor de todas las notificaciones toast activas
 * Se renderiza una sola vez en el layout principal
 */
export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}
