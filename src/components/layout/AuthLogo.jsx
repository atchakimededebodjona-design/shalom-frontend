'use client';

import { useState } from 'react';

// Logo SHALOM. Utilise /public/shalom-logo.png ;
// tant que le fichier n'est pas présent, on retombe sur le mot-symbole doré.
export const AuthLogo = ({
  className = 'auth-logo',
  alt = 'SHALOM',
  fallbackSize = '2.8rem',
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className="text-center"
        style={{
          display: 'block',
          fontFamily: 'var(--font-brand)',
          fontSize: fallbackSize,
          fontWeight: 'bold',
          letterSpacing: '0.08em',
          color: 'var(--primary)',
          marginBottom: 'var(--spacing-xs)',
        }}
      >
        SHALOM
      </span>
    );
  }

  return (
    <img
      src="/shalom-logo.png"
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};
