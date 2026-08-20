import { useCallback, useState } from 'react';
import { getApiError } from '../utils/apiError';

/**
 * Factorise le pattern {items, pagination, loading, error} + "Charger plus"
 * réimplémenté indépendamment dans billing, messages, groups, wallet,
 * search, finance et le fil d'actualité.
 *
 * Ne déclenche rien tout seul : l'appelant décide QUAND charger (au montage,
 * quand un filtre change, après un debounce de recherche...) en appelant
 * `reload()` depuis son propre useEffect — les conditions de déclenchement
 * varient trop d'une page à l'autre pour être devinées ici.
 *
 * @param {(page: number) => Promise<{items: any[], pagination: object}>} fetchPage
 *   Appelle le service et adapte sa réponse à la forme {items, pagination}
 *   (le nom de la clé varie selon l'API : invoices, transactions, groups...).
 * @param {object} [options]
 * @param {(item: any) => any} [options.getKey] - clé d'un item, utilisée pour
 *   dédupliquer au "charger plus" (par défaut item.id ; certaines listes de
 *   profils utilisent item.profile?.user_id).
 * @param {boolean} [options.separateLoadingMore] - état loadingMore distinct
 *   de loading (par défaut true ; quelques pages réutilisent un seul loading
 *   pour l'état initial et le "charger plus").
 * @param {boolean} [options.initialLoading] - valeur initiale de `loading`
 *   (par défaut true ; false pour une recherche qui ne charge qu'à la saisie).
 * @param {string} [options.errorMessage] - message de repli si l'API ne
 *   renvoie aucun détail exploitable (passé à getApiError).
 */
export const usePaginatedFetch = (fetchPage, {
  getKey = (item) => item.id,
  separateLoadingMore = true,
  initialLoading = true,
  errorMessage,
} = {}) => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(initialLoading);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (page, replace) => {
    const setBusy = (v) => (replace || !separateLoadingMore ? setLoading(v) : setLoadingMore(v));
    setBusy(true);
    setError('');
    try {
      const data = await fetchPage(page);
      setItems((prev) => {
        if (replace) return data.items;
        const seen = new Set(prev.map(getKey));
        return [...prev, ...data.items.filter((it) => !seen.has(getKey(it)))];
      });
      setPagination(data.pagination);
    } catch (err) {
      setError(getApiError(err, errorMessage));
    } finally {
      setBusy(false);
    }
  }, [fetchPage, getKey, separateLoadingMore, errorMessage]);

  const reload = useCallback(() => load(1, true), [load]);

  const loadMore = useCallback(() => {
    if (!pagination?.has_next || loadingMore || loading) return;
    load(pagination.page + 1, false);
  }, [pagination, loadingMore, loading, load]);

  return { items, setItems, pagination, setPagination, loading, loadingMore, error, setError, load, reload, loadMore };
};
