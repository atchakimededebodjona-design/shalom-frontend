'use client';

import { resolveMediaUrl } from '../../utils/resolveMediaUrl';

// Avatar utilisateur : affiche l'image si disponible, sinon les initiales sur fond coloré.
// On utilise <img> plutôt que next/image car les URLs viennent de profils
// utilisateurs arbitraires (pas de remotePatterns à configurer).
export const Avatar = ({ src, name = '', size = 44 }) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '?';

  const baseStyle = {
    width: size,
    height: size,
    borderRadius: 'var(--radius-full)',
    flexShrink: 0,
    objectFit: 'cover',
    border: '1px solid var(--border-color)',
  };

  if (src) {
    return <img src={resolveMediaUrl(src)} alt={name} style={baseStyle} />;
  }

  return (
    <div
      aria-hidden="true"
      style={{
        ...baseStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--primary)',
        color: 'var(--on-primary)',
        fontWeight: 'bold',
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  );
};
