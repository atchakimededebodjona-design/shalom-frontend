'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinAmbassador() {
  const router = useRouter();

  useEffect(() => {
    // Tous les utilisateurs sont ambassadeurs par défaut, cette page redirige vers le dashboard
    router.replace('/ambassador');
  }, [router]);

  return null;
}
