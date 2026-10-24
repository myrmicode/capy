-- Compte parent optionnel : synchronisation des profils enfants entre appareils.
--
-- Données minimales : pour un enfant, uniquement le prénom ou surnom, la classe,
-- la toile (niveaux) et la progression. Jamais de nom de famille, d'école, de date
-- de naissance, de photo ni de voix. Le parent n'est connu que par son compte
-- (adresse e-mail, gérée par Supabase Auth).

create table public.profils_enfants (
  -- Identifiant créé par l'appli sur l'appareil (le profil existe d'abord en local).
  id text primary key check (char_length(id) between 1 and 64),
  parent_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  prenom text not null check (char_length(prenom) between 1 and 20),
  classe text not null check (classe in ('CP', 'CE1', 'CE2', 'CM1', 'CM2')),
  progression jsonb not null default '{}'::jsonb,
  toile jsonb,
  -- Date de dernière modification sur l'appareil, pour fusionner les modifications.
  modifie_le timestamptz not null default now()
);

create index profils_enfants_parent_idx on public.profils_enfants (parent_id);

-- Row Level Security : chaque parent ne voit et ne modifie que ses propres profils.
alter table public.profils_enfants enable row level security;

create policy "Lire ses profils"
  on public.profils_enfants for select to authenticated
  using ((select auth.uid()) = parent_id);

create policy "Créer ses profils"
  on public.profils_enfants for insert to authenticated
  with check ((select auth.uid()) = parent_id);

create policy "Modifier ses profils"
  on public.profils_enfants for update to authenticated
  using ((select auth.uid()) = parent_id)
  with check ((select auth.uid()) = parent_id);

create policy "Supprimer ses profils"
  on public.profils_enfants for delete to authenticated
  using ((select auth.uid()) = parent_id);

-- Aucun accès pour les visiteurs sans compte.
revoke all on public.profils_enfants from anon;
