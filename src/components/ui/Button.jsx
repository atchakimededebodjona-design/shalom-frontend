'use client';

export const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', isLoading = false, style, ...props }) => {
  const baseStyle = {
    padding: 'var(--spacing-sm) var(--spacing-lg)',
    borderRadius: 'var(--radius-md)',
    fontWeight: 'bold',
    border: 'none',
    transition: 'all 0.2s ease',
    opacity: isLoading ? 0.7 : 1,
    cursor: isLoading ? 'not-allowed' : 'pointer',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--primary)',
      color: 'var(--on-primary)',
      boxShadow: 'var(--shadow-md)',
    },
    secondary: {
      backgroundColor: 'var(--bg-color-alt)',
      color: 'var(--text-color)',
      border: '1px solid var(--border-color)',
    },
    accent: {
      backgroundColor: 'var(--accent)',
      color: '#111827',
      boxShadow: 'var(--shadow-md)',
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      style={{ ...baseStyle, ...variants[variant], ...style }}
      className={`hover-lift ${className}`}
      {...props}
    >
      {isLoading ? 'Chargement...' : children}
    </button>
  );
};
