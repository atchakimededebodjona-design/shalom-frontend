'use client';

export const Input = ({ label, type = 'text', id, error, ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)' }}>
      {label && <label htmlFor={id} style={{ fontWeight: 'bold', fontSize: 'var(--spacing-sm)' }}>{label}</label>}
      <input
        id={id}
        type={type}
        style={{
          width: '100%',
          borderColor: error ? 'red' : 'var(--border-color)'
        }}
        {...props}
      />
      {error && <span style={{ color: 'red', fontSize: '12px' }}>{error}</span>}
    </div>
  );
};
