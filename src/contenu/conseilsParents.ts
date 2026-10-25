// Idées de petits jeux sans écran, à faire avec l'enfant dans la vie de tous
// les jours, pour les compétences que Capy fait travailler. À faire relire par
// un enseignant, comme le reste du contenu.
import type { DomaineId } from '@/config/domaines';

export const CONSEILS_PARENTS: Partial<Record<DomaineId, string>> = {
  'resoudre-problemes':
    'Aux courses, inventez de petits problèmes : « Il y a 3 paquets de 4 yaourts, combien de yaourts en tout ? »',
  'calcul-mental': 'En voiture ou en marchant, jouez au double : vous dites un nombre, l’enfant donne son double.',
  'tables-addition':
    'Lancez deux dés et additionnez les faces, chacun son tour. Qui trouve sans compter sur ses doigts ?',
  'ligne-graduee': 'Mesurez des objets avec un mètre ruban : où est 15 cm ? Et 25 cm ? Qu’y a-t-il au milieu ?',
  'poser-calculer': 'Faites vérifier un ticket de caisse : l’enfant pose l’addition de deux ou trois prix.',
  fractions: 'Partagez une pizza ou un gâteau en parts égales, et nommez-les : la moitié, le tiers, le quart.',
  'ecrire-nombres': 'Lisez ensemble les nombres autour de vous : prix, numéros des maisons, pages d’un livre.',
  'accord-nom-adjectif':
    'Décrivez des objets à deux : « une pomme rouge, des pommes rouges ». Que change-t-on à l’écrit ?',
  'nature-mots': 'Chacun son tour, dites un mot ; l’autre dit s’il s’agit d’un nom, d’un verbe ou d’un adjectif.',
  synonymes: 'Cherchez ensemble d’autres mots pour dire « content » ou « grand ». Combien en trouvez-vous à deux ?',
  'familles-mots': 'Partez d’un mot, par exemple « lait », et trouvez sa famille : laitier, laitage, allaiter…',
  'sujet-verbe': 'Lisez une phrase d’un livre et demandez : « Qui fait l’action ? Quelle est l’action ? »',
  conjugaison: 'Racontez la journée à trois moments : « Hier, je jouais. Aujourd’hui, je joue. Demain, je jouerai. »',
  'ecrire-mots': 'Écrivez ensemble la liste des courses : l’enfant écrit les mots, puis vous relisez à deux.',
  'comprendre-phrases-lues': 'Faites lire la règle d’un jeu de société ou une recette, puis réalisez-la ensemble.',
  'comprendre-texte-lu':
    'Après l’histoire du soir, posez une question dont la réponse est dans le texte, puis cherchez-la ensemble.',
  'comprendre-texte-entendu': 'Racontez une courte histoire, puis demandez à l’enfant de la raconter à son tour.',
};
