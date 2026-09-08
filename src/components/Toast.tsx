import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type, title, message, onClose }) => {
  const isSuccess = type === 'success';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-xl shadow-2xl border backdrop-blur-md animate-fade-in flex items-start gap-3.5 ${
        isSuccess
          ? 'bg-emerald-950/90 text-white border-emerald-500/30'
          : 'bg-red-950/90 text-white border-red-500/30'
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {isSuccess ? (
          <CheckCircle2 className="text-emerald-400" size={20} />
        ) : (
          <AlertCircle className="text-red-400" size={20} />
        )}
      </div>

      <div className="flex-1 space-y-1">
        <h4 className="text-xs font-semibold uppercase tracking-wider">{title}</h4>
        <p className="text-xs text-neutral-300 font-light leading-relaxed">{message}</p>
      </div>

      <button
        onClick={onClose}
        className="p-1 text-neutral-400 hover:text-white transition-colors"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};
