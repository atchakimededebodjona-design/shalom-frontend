import { useState } from 'react';
import { camajService } from '../../services/camaj.service';

// État + cycle de soumission communs aux 5 formulaires CAMAJ : saisie d'un
// champ simple, bascule d'une valeur dans un champ multi-valeurs (checkbox),
// et l'envoi (erreur/chargement/succès) vers camajService.submit(type, form).
export const useCamajForm = (type, initialState) => {
  const [form, setForm] = useState(initialState);
  const [soumis, setSoumis] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((precedent) => ({ ...precedent, [name]: value }));
    setSoumis(false);
  };

  const toggleValue = (field, valeur) => {
    setForm((precedent) => ({
      ...precedent,
      [field]: precedent[field].includes(valeur)
        ? precedent[field].filter((v) => v !== valeur)
        : [...precedent[field], valeur],
    }));
    setSoumis(false);
  };

  const setField = (field, valeur) => {
    setForm((precedent) => ({ ...precedent, [field]: valeur }));
    setSoumis(false);
  };

  // `isValid` peut avoir des effets de bord (ex: marquer des champs comme
  // "touchés" pour afficher leurs messages d'erreur) — appelé avant le
  // court-circuit, comme le faisait chaque formulaire individuellement.
  const handleSubmit = async (e, isValid = () => true) => {
    e.preventDefault();
    if (!isValid()) return;
    setErreur('');
    setEnvoi(true);
    try {
      await camajService.submit(type, form);
      setSoumis(true);
    } catch (err) {
      setErreur(err.response?.data?.error || "L'envoi a échoué. Vérifiez votre connexion et réessayez.");
    } finally {
      setEnvoi(false);
    }
  };

  return { form, setForm, handleChange, toggleValue, setField, soumis, envoi, erreur, handleSubmit };
};
