-- Limite d'appels à l'analyse de la photo (protège le crédit de l'API Claude).
--
-- Deux compteurs par jour :
--  - par appareil : l'appli envoie un identifiant d'installation tiré au hasard,
--    sans lien avec l'enfant, le parent ou le téléphone ;
--  - global : un plafond pour tout le projet, qui protège même si quelqu'un
--    fabrique de faux identifiants.
-- Aucune autre donnée n'est enregistrée, et les compteurs de plus de 7 jours sont effacés.

create table public.quota_analyses (
  cle text not null check (char_length(cle) between 1 and 80),
  jour date not null default (now() at time zone 'Europe/Paris')::date,
  nombre integer not null default 0,
  primary key (cle, jour)
);

-- Aucun accès depuis l'appli : seule la fonction serveur (rôle service) l'utilise.
alter table public.quota_analyses enable row level security;
revoke all on public.quota_analyses from anon, authenticated;

-- Compte un appel et dit s'il reste dans les limites (appareil et global).
create or replace function public.consommer_quota_analyse(p_appareil text, p_max_appareil integer, p_max_global integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_jour date := (now() at time zone 'Europe/Paris')::date;
  v_appareil integer;
  v_global integer;
begin
  delete from public.quota_analyses where jour < v_jour - 7;

  insert into public.quota_analyses as q (cle, jour, nombre) values ('appareil:' || p_appareil, v_jour, 1)
    on conflict (cle, jour) do update set nombre = q.nombre + 1
    returning nombre into v_appareil;

  insert into public.quota_analyses as q (cle, jour, nombre) values ('global', v_jour, 1)
    on conflict (cle, jour) do update set nombre = q.nombre + 1
    returning nombre into v_global;

  return v_appareil <= p_max_appareil and v_global <= p_max_global;
end;
$$;

revoke all on function public.consommer_quota_analyse(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consommer_quota_analyse(text, integer, integer) to service_role;
