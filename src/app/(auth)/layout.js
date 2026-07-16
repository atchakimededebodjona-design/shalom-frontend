// Layout des pages d'authentification : plein écran bleu nuit (aligné sur l'app mobile)
export default function AuthLayout({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-lg)',
        color: '#F3EFE4',
        background:
          'radial-gradient(900px 480px at 50% -12%, rgba(194,152,47,0.14), transparent 62%), #0A1728',
      }}
    >
      {children}
    </div>
  );
}
