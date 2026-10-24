-- Réglages de lecture et de jeu, par enfant (police, taille du texte, toucher
-- puis toucher, mode calme…).
--
-- Confidentialité : ce sont des réglages d'affichage, jamais un diagnostic. On
-- n'enregistre ni trouble, ni handicap, ni raison : seulement les réglages
-- eux-mêmes. L'appli relit ce champ clé par clé et ignore toute autre donnée.

alter table public.profils_enfants
  add column reglages jsonb
  -- Un objet simple de quelques réglages, jamais un texte libre.
  check (reglages is null or (jsonb_typeof(reglages) = 'object' and pg_column_size(reglages) < 2048));
