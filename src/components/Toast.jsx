import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Toast({ message, visible }) {
  return (
    <div className={`toast-notice ${visible ? 'show' : ''}`} role="status" aria-live="polite">
      <CheckCircle2 size={16} color="#26A57D" />
      <span>{message}</span>
    </div>
  );
}
