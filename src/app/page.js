import Link from 'next/link';
import { AuthLogo } from '../components/layout/AuthLogo';
import { HomeCta } from '../components/layout/HomeCta';
import { Users, GraduationCap, BookOpen, Target, Heart, Award } from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section 
        className="animate-fade-in" 
        style={{ 
          padding: 'var(--spacing-3xl) var(--spacing-md)', 
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: 'radial-gradient(circle at top, rgba(201, 160, 56, 0.08) 0%, transparent 60%)'
        }}
      >
        <div className="container flex-col items-center">
          <h1 style={{ width: '100%', marginBottom: 'var(--spacing-md)' }}>
            <AuthLogo className="hero-logo" alt="Bienvenue sur SHALOM" fallbackSize="3.5rem" />
          </h1>
          <p className="text-lg text-muted" style={{ maxWidth: '640px', margin: '0 auto', marginBottom: 'var(--spacing-xl)', lineHeight: 1.8 }}>
            Connecte, Inspire, Transforme. La première plateforme chrétienne francophone conçue pour la jeunesse d'Afrique.
          </p>
          <HomeCta />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mb-2xl" style={{ padding: 'var(--spacing-2xl) 0' }}>
        <h2 className="text-center" style={{ marginBottom: 'var(--spacing-2xl)', fontSize: '2rem', color: 'var(--secondary)' }}>
          Pourquoi nous rejoindre ?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-xl)' }}>
          
          <div className="glass p-lg hover-lift" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-xl)' }}>
            <div style={{ background: 'var(--gradient-primary)', width: '48px', height: '48px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--spacing-md)', color: '#fff' }}>
              <Users size={24} />
            </div>
            <h3 className="text-secondary" style={{ marginBottom: 'var(--spacing-sm)' }}>Réseau Social</h3>
            <p className="text-muted">Partagez vos inspirations, commentez et connectez-vous avec d'autres jeunes partageant vos valeurs.</p>
          </div>

          <div className="glass p-lg hover-lift" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-xl)' }}>
            <div style={{ background: 'var(--gradient-primary)', width: '48px', height: '48px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--spacing-md)', color: '#fff' }}>
              <Heart size={24} />
            </div>
            <h3 className="text-secondary" style={{ marginBottom: 'var(--spacing-sm)' }}>Accompagnement</h3>
            <p className="text-muted">Trouvez des mentors expérimentés pour vous guider spirituellement et professionnellement.</p>
          </div>

          <div className="glass p-lg hover-lift" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-xl)' }}>
            <div style={{ background: 'var(--gradient-primary)', width: '48px', height: '48px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--spacing-md)', color: '#fff' }}>
              <BookOpen size={24} />
            </div>
            <h3 className="text-secondary" style={{ marginBottom: 'var(--spacing-sm)' }}>Formations</h3>
            <p className="text-muted">Rejoignez des groupes d'étude et participez à des formations exclusives pour votre croissance.</p>
          </div>

          <Link href="/camaj/soumettre-projet-faj" className="glass p-lg hover-lift" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-xl)', display: 'block', textDecoration: 'none' }}>
            <div style={{ background: 'var(--gradient-secondary)', width: '48px', height: '48px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--spacing-md)', color: '#fff' }}>
              <Target size={24} />
            </div>
            <h3 className="text-secondary" style={{ marginBottom: 'var(--spacing-sm)' }}>Financement FAJ</h3>
            <p className="text-muted">Candidatez au Fonds d'Appui à la Jeunesse du CAMAJ et faites financer votre projet.</p>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: 'var(--spacing-3xl) 0', background: 'var(--glass-bg)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container text-center">
          <h2 style={{ marginBottom: 'var(--spacing-2xl)', fontSize: '2rem', color: 'var(--secondary)' }}>Ils témoignent</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--spacing-lg)', textAlign: 'left' }}>
            {[
              { text: "SHALOM a complètement transformé ma façon de me connecter à ma foi au quotidien.", author: "Sarah, 24 ans" },
              { text: "Grâce au mentorat CAMAJ, j'ai pu lancer mon propre projet et être accompagné à chaque étape.", author: "Emmanuel, 27 ans" },
              { text: "Les formations m'ont permis de grandir spirituellement entouré de jeunes qui partagent mes valeurs.", author: "Grace, 22 ans" },
              { text: "Le financement FAJ m'a permis de concrétiser mon projet communautaire. Merci à l'équipe !", author: "Josué, 26 ans" }
            ].map((t, i) => (
              <div key={i} className="glass p-lg" style={{ borderRadius: 'var(--radius-xl)', background: 'var(--bg-color-alt)' }}>
                <p className="text-muted" style={{ fontStyle: 'italic', marginBottom: 'var(--spacing-lg)', lineHeight: 1.6 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                    {t.author.charAt(0)}
                  </div>
                  <p className="font-bold text-secondary">{t.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
