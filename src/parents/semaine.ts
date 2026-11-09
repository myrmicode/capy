// Résumé de la semaine pour les parents : des phrases plutôt que des chiffres,
// jamais de comparaison avec d'autres enfants, jamais de reproche.
import type { Classe } from '@/config/classes';
import { domaineDe, type DomaineId } from '@/config/domaines';
import { dateLocale, decaler, tempsDeLaSemaine, type ProgressionEnfant } from '@/parcours/progression';
import { QUESTIONS_TABLES } from '@/parcours/tables';
import { avecPhotoDeJanvier, symboleDe, type Niveaux, type ToileEnfant } from '@/toile/niveaux';

import { dureeEnFrancais } from './format';
import { tendanceVitesse } from './vitesse';

interface ProfilResume {
  prenom: string;
  classe: Classe;
  progression: ProgressionEnfant;
  toile?: ToileEnfant;
}

/** Les jours (AAAA-MM-JJ) des 7 derniers jours, aujourd'hui compris. */
function semaine(aujourdhui: string): Set<string> {
  return new Set(Array.from({ length: 7 }, (_, i) => decaler(aujourdhui, -i)));
}

const liste = (mots: string[]) =>
  mots.length <= 1 ? (mots[0] ?? '') : `${mots.slice(0, -1).join(', ')} et ${mots[mots.length - 1]}`;

export function resumeSemaine(profil: ProfilResume, maintenant = new Date()): string[] {
  const p = profil.progression;
  const aujourdhui = dateLocale(maintenant);
  const jours7 = semaine(aujourdhui);
  const phrases: string[] = [];

  const joursActifs = p.jours.filter((j) => jours7.has(j)).length;
  if (joursActifs === 0) {
    phrases.push(
      `${profil.prenom} n’a pas encore joué cette semaine. Quelques minutes suffisent : le défi du jour ne compte que 3 questions.`,
    );
  } else {
    const secondes = tempsDeLaSemaine(p, aujourdhui);
    // Moins d'une minute : « 0 min » ne dirait rien d'utile.
    const temps = secondes >= 60 ? `, ${dureeEnFrancais(secondes)} en tout` : '';
    phrases.push(`Cette semaine, ${profil.prenom} a joué ${joursActifs} jour${joursActifs > 1 ? 's' : ''}${temps}.`);
  }

  const defis = Object.entries(p.defis ?? {}).filter(([j, e]) => jours7.has(j) && e > 0).length;
  if (defis > 0) phrases.push(`Défi du jour réussi ${defis} fois.`);

  // Ce qui avance depuis la fiche de l'école (toile de septembre → toile du jour).
  if (profil.toile) {
    const progres = (depuis: Niveaux, jusqua: Niveaux) => {
      const avance: string[] = [];
      for (const [id, actuel] of Object.entries(jusqua)) {
        const depart = depuis[id as DomaineId];
        if (depart === undefined || actuel === undefined) continue;
        const avant = symboleDe(depart);
        const apres = symboleDe(actuel);
        const domaine = domaineDe(profil.classe, id as DomaineId);
        if (domaine && apres.length > avant.length)
          avance.push(`${domaine.libelle.toLowerCase()} (de ${avant} à ${apres})`);
      }
      return avance;
    };
    const avance = progres(profil.toile.septembre, profil.toile.actuelle);
    if (avance.length > 0) phrases.push(`Depuis la fiche de l’école, ça avance : ${liste(avance)}.`);
    const janvier = avecPhotoDeJanvier(profil.toile, profil.classe, aujourdhui).janvier;
    if (janvier) {
      const depuisJanvier = progres(janvier, profil.toile.actuelle);
      if (depuisJanvier.length > 0) phrases.push(`Depuis janvier aussi : ${liste(depuisJanvier)}.`);
    }
  }

  const aRevoir = Object.values(p.aRevoir ?? {});
  if (aRevoir.length > 0) {
    const domaines = [
      ...new Set(aRevoir.map((r) => domaineDe(profil.classe, r.domaine)?.libelle.toLowerCase())),
    ].filter((d): d is string => d !== undefined);
    phrases.push(
      `Capy fera revoir, dans les prochains jours et sous une autre forme, ce qui a demandé plusieurs essais${
        domaines.length > 0 ? ` (${liste(domaines)})` : ''
      }. C’est normal : c’est comme ça qu’on apprend.`,
    );
  }

  const histoires = Object.keys(p.histoires ?? {}).length;
  if (histoires > 0)
    phrases.push(`${histoires} histoire${histoires > 1 ? 's' : ''} de Capy lue${histoires > 1 ? 's' : ''} jusqu’ici.`);

  // Lire à deux : les lectures de la semaine, et la meilleure.
  const lectures = Object.values(p.lectures ?? {})
    .flat()
    .filter((l) => jours7.has(l.jour));
  if (lectures.length > 0) {
    const meilleure = Math.max(...lectures.map((l) => l.motsParMinute));
    phrases.push(
      `Lire à deux : ${lectures.length} lecture${lectures.length > 1 ? 's' : ''} cette semaine, jusqu’à ${meilleure} mots bien lus en une minute.`,
    );
  }

  // Ce qui devient automatique : des réponses justes plus rapides qu’au début.
  const plusRapides = Object.entries(p.vitesse ?? {})
    .filter(([, mesures]) => tendanceVitesse(mesures)?.sens === 'plusRapide')
    .map(([id]) => domaineDe(profil.classe, id as DomaineId)?.libelle.toLowerCase())
    .filter((d): d is string => d !== undefined);
  if (plusRapides.length > 0)
    phrases.push(`Réponses justes plus rapides qu’au début : ${liste(plusRapides)}. Ça devient automatique.`);

  const chronos = Object.values(p.chronos ?? {}).filter((c) => c.derniers.some((d) => jours7.has(d.jour)));
  if (chronos.length > 0) {
    const record = Math.max(...chronos.map((c) => c.record));
    phrases.push(`Le chrono de Capy : record de ${record} bonnes réponses en une minute.`);
  }

  // Les tables de Capy : celles jouées cette semaine, et celles déjà réussies sans faute.
  const tables = Object.entries(p.tables ?? {}).filter(([, t]) => t.derniers.some((d) => jours7.has(d.jour)));
  if (tables.length > 0) {
    const nom = (cle: string) => (cle === 'toutes' ? 'toutes les tables' : `table de ${cle.replace('table-', '')}`);
    const sansFaute = tables.filter(([, t]) => t.record === QUESTIONS_TABLES).map(([cle]) => nom(cle));
    phrases.push(
      `Les tables de Capy : ${liste(tables.map(([cle]) => nom(cle)))} cette semaine.` +
        (sansFaute.length > 0 ? ` Sans faute : ${liste(sansFaute)}.` : ''),
    );
  }

  return phrases;
}
