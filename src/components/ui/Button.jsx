'use client';

export const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', isLoading = false, style, ...props }) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`${baseClasses} ${variantClasses[variant] || ''} hover-lift ${className}`}
      style={style}
      {...props}
    >
      {isLoading ? 'Chargement...' : children}
    </button>
  );
};
