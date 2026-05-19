'use client';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  onDismiss: () => void;
}

export function Toast({ message, type = 'info', onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={`ch-toast ${type === 'info' ? 'info' : type === 'error' ? 'error' : ''}`}>
      {type === 'success' && '✓ '}{message}
    </div>
  );
}
