'use client';

import { useToastStore } from '../store/toastStore';
import Toast from './Toast';

/**
 * ToastContainer - Contenedor global para mostrar todos los toasts
 * Se debe incluir una sola vez en el layout principal
 */
export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-0 right-0 z-[9999] p-4 space-y-3 pointer-events-none">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{
            marginTop: index > 0 ? '12px' : '0'
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
