'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // En dev, Next.js réutilise souvent les mêmes URLs de chunks d'une
    // modification à l'autre (pas de hash de contenu comme en prod) : le
    // cache-first du service worker sur /_next/static/ servirait alors du
    // JS périmé indéfiniment. On ne l'active donc qu'en production.
    if (process.env.NODE_ENV !== 'production') return;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}
