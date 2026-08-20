'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ambassadorService from '../../../../services/ambassador.service';

export default function JoinAmbassador() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    // Tous les comptes sont inscrits au programme ambassadeur dès leur création
    // (voir auth.controller.js), donc cette page ne devrait normalement jamais
    // servir. Elle reste comme filet de rattrapage pour un compte dont le
    // profil ambassadeur serait absent (compte antérieur à l'auto-inscription,
    // profil supprimé...) : /ambassador redirige ici sur 404, donc on doit
    // réellement (re)joindre le programme avant de renvoyer au tableau de
    // bord, sinon les deux pages se renvoient la balle indéfiniment.
    const join = async () => {
      try {
        await ambassadorService.joinProgram({});
      } catch (err) {
        if (err.response?.data?.code !== 'ALREADY_AMBASSADOR') {
          setError("Impossible d'activer l'espace ambassadeur pour le moment. Réessayez plus tard.");
          return;
        }
      }
      router.replace('/ambassador');
    };
    join();
  }, [router]);

  if (error) {
    return (
      <div className="container flex-col items-center justify-center" style={{ minHeight: '50vh', textAlign: 'center' }}>
        <p className="text-muted">{error}</p>
      </div>
    );
  }

  return null;
}
