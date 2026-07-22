'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = ({ label, type = 'text', id, error, style, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)', position: 'relative' }}>
      {label && <label htmlFor={id} style={{ fontWeight: 'bold', fontSize: 'var(--spacing-sm)' }}>{label}</label>}
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          id={id}
          type={inputType}
          style={{
            width: '100%',
            borderColor: error ? 'red' : 'var(--border-color)',
            paddingRight: isPassword ? '40px' : undefined,
            ...style
          }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span style={{ color: 'red', fontSize: '12px' }}>{error}</span>}
    </div>
  );
};
