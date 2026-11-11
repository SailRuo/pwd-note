import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-all"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm glass-panel rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-3.5 shadow-lg shadow-rose-500/20">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold dark:text-white text-slate-800 tracking-wide">{title}</h3>
        <p className="text-xs dark:text-white/60 text-slate-500 mt-1.5 leading-relaxed">{message}</p>

        <div className="mt-6 flex items-center space-x-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl glass-btn text-xs font-medium dark:text-white/70 text-slate-600 hover:text-slate-900 transition-all"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
};
