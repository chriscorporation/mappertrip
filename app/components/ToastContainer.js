'use client';

import { useToastStore } from '../store/toastStore';

/**
 * ToastContainer - Contenedor de notificaciones toast
 *
 * Características:
 * - Posicionado en la esquina superior derecha
 * - Animaciones suaves de entrada y salida
 * - Diferentes estilos para cada tipo (success, error, info, warning)
 * - Auto-dismiss con barra de progreso
 * - Click para cerrar manualmente
 */

const TOAST_ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠'
};

const TOAST_STYLES = {
  success: {
    bg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    border: 'border-emerald-400',
    text: 'text-white',
    iconBg: 'bg-emerald-600'
  },
  error: {
    bg: 'bg-gradient-to-r from-red-500 to-rose-500',
    border: 'border-red-400',
    text: 'text-white',
    iconBg: 'bg-red-600'
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    border: 'border-blue-400',
    text: 'text-white',
    iconBg: 'bg-blue-600'
  },
  warning: {
    bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
    border: 'border-amber-400',
    text: 'text-white',
    iconBg: 'bg-amber-600'
  }
};

function Toast({ toast }) {
  const removeToast = useToastStore((state) => state.removeToast);
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

  return (
    <div
      className={`
        ${style.bg} ${style.border} ${style.text}
        min-w-[280px] max-w-[400px]
        rounded-lg shadow-lg border
        p-4 mb-3
        flex items-start gap-3
        cursor-pointer
        transform transition-all duration-300 ease-in-out
        hover:scale-105 hover:shadow-xl
        animate-[slideInRight_0.3s_ease-out]
      `}
      onClick={() => removeToast(toast.id)}
      role="alert"
    >
      {/* Icono */}
      <div className={`
        ${style.iconBg}
        w-6 h-6 rounded-full
        flex items-center justify-center
        flex-shrink-0
        font-bold text-sm
      `}>
        {TOAST_ICONS[toast.type]}
      </div>

      {/* Mensaje */}
      <div className="flex-1 pt-0.5">
        <p className="text-sm font-medium leading-relaxed">
          {toast.message}
        </p>
      </div>

      {/* Botón de cerrar */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeToast(toast.id);
        }}
        className="
          flex-shrink-0
          w-5 h-5
          flex items-center justify-center
          rounded-full
          hover:bg-white/20
          transition-colors
          text-xs
        "
        aria-label="Cerrar notificación"
      >
        ×
      </button>

      {/* Barra de progreso */}
      <div
        className="
          absolute bottom-0 left-0 right-0
          h-1 bg-white/30 rounded-b-lg
          overflow-hidden
        "
      >
        <div
          className="h-full bg-white/50"
          style={{
            animation: `progress ${toast.duration}ms linear`
          }}
        />
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100000] flex flex-col items-end">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
