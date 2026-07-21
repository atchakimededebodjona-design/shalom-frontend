import { AuthLogo } from '../components/layout/AuthLogo';
import { HomeCta } from '../components/layout/HomeCta';

export default function Home() {
  return (
    <div style={{ padding: '0 var(--spacing-md)' }}>
      {/* Hero Section */}
      <section className="container flex-col items-center justify-center text-center animate-fade-in" style={{ padding: 'var(--spacing-2xl) 0', minHeight: '60vh' }}>
        <h1 style={{ width: '100%' }}>
          <AuthLogo className="hero-logo" alt="Bienvenue sur SHALOM" fallbackSize="3.5rem" />
        </h1>
        <p className="text-lg text-muted" style={{ maxWidth: '600px', margin: '0 auto', marginBottom: 'var(--spacing-xl)' }}>
          Connecte, Inspire, Transforme. La plateforme chrétienne francophone pour la jeunesse d'Afrique.
        </p>
        <HomeCta />
      </section>

      {/* Features Section */}
      <section className="container mb-2xl" style={{ padding: 'var(--spacing-2xl) 0' }}>
        <h2 className="text-center mb-xl">Pourquoi nous rejoindre ?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-xl)' }}>
          <div className="glass p-lg hover-lift" style={{ borderRadius: 'var(--radius-lg)' }}>
            <h3 className="text-primary">Réseau Social</h3>
            <p className="text-muted">Partagez vos inspirations, commentez et connectez-vous avec d'autres jeunes partageant vos valeurs.</p>
          </div>
          <div className="glass p-lg hover-lift" style={{ borderRadius: 'var(--radius-lg)' }}>
            <h3 className="text-primary">Mentorat</h3>
            <p className="text-muted">Trouvez des mentors expérimentés pour vous guider spirituellement et professionnellement.</p>
          </div>
          <div className="glass p-lg hover-lift" style={{ borderRadius: 'var(--radius-lg)' }}>
            <h3 className="text-primary">Groupes & Formations</h3>
            <p className="text-muted">Rejoignez des groupes d'étude et participez à des formations exclusives.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container" style={{ padding: 'var(--spacing-2xl) 0', textAlign: 'center' }}>
        <div className="glass p-lg" style={{ borderRadius: 'var(--radius-lg)', maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.2rem', marginBottom: 'var(--spacing-md)' }}>
            "SHALOM a complètement transformé ma façon de me connecter à ma foi au quotidien. Une vraie communauté !"
          </p>
          <p className="font-bold text-primary">- Sarah, 24 ans</p>
        </div>
      </section>
    </div>
  );
}
