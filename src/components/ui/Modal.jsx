'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// Modale générique : overlay sombre + panneau "glass" centré.
// Ferme sur clic overlay, bouton ✕, ou touche Échap.
//
// Rendue via un portail dans document.body : les pages utilisent la classe
// `animate-fade-in` (transform: translateY(...) pendant l'animation), et tout
// élément avec un `transform` non-`none` devient un bloc englobant pour ses
// descendants en `position: fixed` — sans portail, l'overlay ne se fixe plus
// au vrai viewport mais au conteneur de page, et déborde/scrolle avec elle.
export const Modal = ({ isOpen, onClose, title, children, maxWidth = '480px' }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    // Empêche le scroll de l'arrière-plan
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-md)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="glass animate-fade-in"
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-color-alt)',
        }}
      >
        <div
          className="flex items-center justify-between p-md"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="hover-lift"
            style={{ display: 'flex', background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: 'var(--spacing-xs)' }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: 'var(--spacing-md)', flex: 1, minHeight: 0 }}>{children}</div>
      </div>
    </div>,
    document.body
  );
};
