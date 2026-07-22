// Layout des pages d'authentification : premium glassmorphic
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
        color: '#F8FAFC',
        background: '#08111D',
        backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(201, 160, 56, 0.15), transparent 25%), radial-gradient(circle at 85% 30%, rgba(22, 50, 84, 0.8), transparent 25%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background glowing orb */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.1, borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'var(--secondary)', filter: 'blur(150px)', opacity: 0.5, borderRadius: '50%' }} />
      
      <div className="glass" style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '440px',
        padding: 'var(--spacing-2xl)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-glow), 0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        background: 'rgba(16, 30, 49, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {children}
      </div>
    </div>
  );
}
