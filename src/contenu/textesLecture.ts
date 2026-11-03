// Les textes de « Lire à deux » : l'enfant lit à voix haute pendant une minute,
// l'adulte suit sur l'écran. Comme pour la lecture à voix haute des évaluations,
// on compte les mots bien lus en une minute (la fluence).
// - CP : une liste de syllabes, puis une liste de mots (déchiffrer) ;
// - du CE1 au CM2 : de petites histoires, plus longues et plus riches chaque année,
//   assez longues pour qu'une minute ne suffise pas à les finir.
// Relire le même texte plusieurs jours de suite (la lecture répétée) est ce qui
// fait le plus progresser : Capy le propose. À FAIRE RELIRE PAR UN ENSEIGNANT.
import type { Classe } from '@/config/classes';

export interface TexteLecture {
  id: string;
  classe: Classe;
  titre: string;
  texte: string;
}

export const TEXTES_LECTURE: readonly TexteLecture[] = [
  {
    id: 'cp-syllabes',
    classe: 'CP',
    titre: 'Les syllabes de Capy',
    texte:
      'la mi ro tu pa li mo ru sa fi vo nu ta ri lu po fa mu si no ra ti vu lo ma su ni fo ri pu ' +
      'cha ve bo di ju ga co lé ou on mou ton roi pon dé bu ché vi ré pi so du ba lé fu né ' +
      'bra cri tro plu fla gre clo dra pri vro blé gli fri cla trou pla bro dri cru glo',
  },
  {
    id: 'cp-mots',
    classe: 'CP',
    titre: 'Les mots de Capy',
    texte:
      'le lit la rue un ami le vélo la lune une moto il a lu la pomme le loup un rat ' +
      'le chat la tomate une fourmi le domino il fume la mare le sapin un radis papa ' +
      'le canari une salade la poule le moulin un mouton la fusée le pirate un cadeau ' +
      'la tortue le robot une cabane il chante la limace le melon une fleur le dragon',
  },
  {
    id: 'ce1-cabane',
    classe: 'CE1',
    titre: 'La cabane dans le pré',
    texte:
      'Mardi, Capy et Lina construisent une cabane au fond du pré. Ils ramassent des branches, des feuilles et une ' +
      'vieille couverture rouge. Lina tient les branches, et Capy les attache avec une ficelle. Au bout d’une heure, ' +
      'la cabane est prête. Elle est petite, mais elle tient bien debout. Les deux amis s’assoient dedans avec un panier ' +
      'de pommes. Soudain, il se met à pleuvoir très fort. Les gouttes tapent sur le toit de feuilles, mais personne ' +
      'n’est mouillé. Capy rit : « Notre cabane est la meilleure du monde ! » Lina sort une lampe de poche de son sac. ' +
      'Ils jouent aux ombres chinoises jusqu’au soir. Quand la pluie s’arrête, un arc-en-ciel se lève au-dessus de la ' +
      'colline. Ils rentrent à la maison en courant, et ils promettent de revenir demain.',
  },
  {
    id: 'ce1-marche',
    classe: 'CE1',
    titre: 'Au marché du village',
    texte:
      'Le samedi matin, Capy va au marché avec son grand-père. Il fait beau et les rues sont pleines de monde. Sur les ' +
      'tables, il y a des tomates rouges, des salades vertes et des fraises qui sentent bon. Le grand-père achète du ' +
      'pain, du fromage et un gros melon. Capy porte le panier. Il est content, car il aide. Devant un stand, une dame ' +
      'vend des fleurs. Capy choisit un bouquet de tulipes jaunes pour sa maman. Il compte ses pièces une à une : il ' +
      'en a juste assez. La dame lui sourit et lui donne une fleur de plus. Sur le chemin du retour, le panier devient ' +
      'lourd. Le grand-père le prend un moment. À la maison, maman met les tulipes dans un vase, au milieu de la table.',
  },
  {
    id: 'ce1-neige',
    classe: 'CE1',
    titre: 'La première neige',
    texte:
      'Ce matin, quand Capy ouvre ses volets, tout est blanc. La neige est tombée pendant la nuit ! Il met vite son ' +
      'bonnet, ses gants et ses bottes. Dans le jardin, la neige lui arrive aux genoux. Il fait une grosse boule, puis ' +
      'une autre, plus petite. Il pose la petite sur la grosse : voilà un bonhomme de neige. Pour les yeux, il prend deux ' +
      'cailloux. Pour le nez, une carotte. Son ami le hérisson passe la tête hors de son tas de feuilles. Il a froid et ' +
      'il retourne dormir. Les oiseaux cherchent des graines sur la neige. Capy leur apporte du pain. Quand il rentre, ' +
      'ses joues sont rouges et ses mains sont gelées. Sa maman lui prépare un grand bol de chocolat chaud.',
  },
  {
    id: 'ce2-phare',
    classe: 'CE2',
    titre: 'Le gardien du phare',
    texte:
      'Au bout de la jetée se dresse un vieux phare blanc et rouge. Monsieur Marin en est le gardien depuis trente ans. ' +
      'Chaque soir, il monte les cent vingt marches de l’escalier en colimaçon pour allumer la grande lampe. Sa lumière ' +
      'tourne toute la nuit et guide les bateaux vers le port. Un jour de tempête, Capy vient lui rendre visite. Le vent ' +
      'siffle, les vagues frappent les rochers et la pluie fouette les vitres. Soudain, la lampe s’éteint ! Monsieur Marin ' +
      'ne perd pas son calme. Il sort une boîte à outils, change une pièce usée et rallume la lumière. Au loin, un petit ' +
      'bateau de pêche avance vers les rochers. En voyant la lumière revenir, le pêcheur tourne la barre et rentre au ' +
      'port sans danger. Le lendemain, il apporte au gardien un panier de poissons pour le remercier. Capy est fier ' +
      'de son ami : sans lui, la nuit aurait pu mal finir.',
  },
  {
    id: 'ce2-potager',
    classe: 'CE2',
    titre: 'Le potager de l’école',
    texte:
      'Cette année, la classe de Capy a décidé de créer un potager dans un coin de la cour. Au printemps, les élèves ' +
      'retournent la terre avec des pelles et des râteaux. Ils sèment des radis, des haricots et des graines de ' +
      'tournesol. Chaque jour, deux enfants sont chargés de l’arrosage. Au bout d’une semaine, de petites pousses vertes ' +
      'sortent de la terre. Tout le monde est émerveillé. Mais un matin, la maîtresse découvre des feuilles grignotées. ' +
      'Qui a fait cela ? Les élèves mènent l’enquête. Ils trouvent des traces brillantes sur le sol : ce sont des ' +
      'limaces ! Plutôt que de les écraser, ils les déposent au bord du ruisseau, derrière l’école. Ensuite, ils ' +
      'entourent les plantes de coquilles d’œufs écrasées, que les limaces n’aiment pas. En juin, la récolte est ' +
      'magnifique. Les tournesols sont plus grands que les élèves, et toute la classe partage une salade de radis.',
  },
  {
    id: 'ce2-musee',
    classe: 'CE2',
    titre: 'La nuit au musée',
    texte:
      'Pour la fête de la science, le musée de la ville organise une nuit spéciale pour les enfants. Capy et sa cousine ' +
      'Zoé ont reçu une invitation. À huit heures du soir, ils arrivent avec leur sac de couchage et une lampe frontale. ' +
      'Le guide les emmène d’abord dans la grande salle des dinosaures. Le squelette du plus grand mesure plus de vingt ' +
      'mètres de long ! Ensuite, ils observent des météorites venues de l’espace et des insectes géants sous une loupe. ' +
      'Vers minuit, les lumières s’éteignent. Chacun s’installe au pied d’une baleine suspendue au plafond. Zoé chuchote : ' +
      '« Et si les animaux se réveillaient ? » Capy rit doucement, mais il garde sa lampe allumée un moment. Au matin, ' +
      'le guide sert un petit déjeuner au milieu des fossiles. En rentrant, Capy sait déjà ce qu’il veut faire plus tard : ' +
      'chercheur de dinosaures.',
  },
  {
    id: 'cm1-volcan',
    classe: 'CM1',
    titre: 'L’expédition au volcan',
    texte:
      'Au cœur de l’Auvergne, la chaîne des Puys aligne des dizaines de volcans endormis depuis des milliers d’années. ' +
      'Pendant les vacances, Capy part en randonnée avec sa tante, qui est géologue. Avant le départ, elle lui explique ' +
      'que ces montagnes arrondies sont nées d’éruptions anciennes : la lave, en refroidissant, a formé des roches noires ' +
      'et poreuses. Le sentier grimpe à travers une forêt de hêtres, puis débouche sur une lande couverte de bruyère. ' +
      'Au sommet, le paysage est spectaculaire. On aperçoit un cratère parfaitement rond, tapissé d’herbe, et d’autres ' +
      'volcans à perte de vue. Sa tante ramasse une pierre légère, pleine de petits trous. « C’est de la pouzzolane, ' +
      'dit-elle. Elle était brûlante quand elle a été projetée dans le ciel. » Capy la soupèse, étonné qu’une pierre ' +
      'puisse être si légère. Pendant le pique-nique, un vent frais se lève et des nuages gris s’accumulent à l’ouest. ' +
      'Prudents, ils redescendent sans tarder. Le soir, Capy dessine dans son carnet le cratère, la pierre et le chemin ' +
      'parcouru, en se promettant de revenir un jour pour explorer les autres volcans.',
  },
  {
    id: 'cm1-orchestre',
    classe: 'CM1',
    titre: 'Le concert de fin d’année',
    texte:
      'Depuis le mois de septembre, l’orchestre de l’école prépare son grand concert. Capy joue du violon, son ami Malik ' +
      'de la trompette, et Léonie frappe les timbales avec beaucoup d’énergie. Chaque mardi, ils répètent dans la salle ' +
      'de musique avec monsieur Rossi, leur chef d’orchestre. Au début, c’était une véritable cacophonie : chacun jouait ' +
      'trop vite ou trop fort, sans écouter les autres. Peu à peu, ils ont appris à suivre la baguette du chef, à respirer ' +
      'ensemble et à attendre leur tour. Le soir du concert, la salle des fêtes est pleine. Derrière le rideau, Capy sent ' +
      'son cœur battre très fort. Ses mains tremblent un peu sur l’archet. Monsieur Rossi leur sourit et murmure : ' +
      '« Oubliez le public, écoutez-vous. » Le rideau s’ouvre. Les premières notes sont hésitantes, puis la musique ' +
      's’envole. Au dernier accord, un silence passe, suivi d’un tonnerre d’applaudissements. Les musiciens saluent, ' +
      'émus et fiers. Dans la salle, la grand-mère de Capy essuie discrètement une larme.',
  },
  {
    id: 'cm1-riviere',
    classe: 'CM1',
    titre: 'Les castors de la rivière',
    texte:
      'Un matin d’automne, Capy remarque que la rivière qui traverse le bois a changé. L’eau, d’habitude rapide, forme ' +
      'maintenant un petit lac tranquille. En s’approchant, il découvre un barrage fait de branches, de boue et de ' +
      'cailloux, solidement entremêlés. Des troncs d’arbres taillés en pointe gisent sur la berge. Ce sont les marques ' +
      'des castors ! Ces animaux rongent le bois avec leurs dents puissantes, qui ne cessent jamais de pousser. Capy ' +
      'décide de revenir au coucher du soleil, car les castors sont surtout actifs la nuit. Caché derrière un buisson, ' +
      'il attend sans bouger. Enfin, une tête brune apparaît à la surface. Le castor nage lentement, une branche dans la ' +
      'gueule, puis plonge vers sa hutte. Soudain, il frappe l’eau avec sa large queue plate : c’est un signal d’alarme ' +
      'pour sa famille. Capy a fait craquer une brindille. Il s’éloigne sur la pointe des pieds, ravi d’avoir observé ' +
      'ces architectes de la rivière.',
  },
  {
    id: 'cm2-explorateurs',
    classe: 'CM2',
    titre: 'Les explorateurs du pôle',
    texte:
      'Au début du vingtième siècle, plusieurs expéditions se lancèrent dans une course extraordinaire : atteindre le pôle ' +
      'Sud, le point le plus inaccessible de la planète. En Antarctique, les températures descendent sous les moins ' +
      'cinquante degrés, et des tempêtes de neige peuvent souffler pendant des jours entiers. En 1911, deux équipes ' +
      'partirent presque en même temps. La première, menée par le Norvégien Roald Amundsen, avait choisi des chiens de ' +
      'traîneau et des skis. La seconde, dirigée par le Britannique Robert Scott, comptait sur des poneys et des ' +
      'traîneaux à moteur. Mais les moteurs gelèrent rapidement et les poneys souffrirent terriblement du froid. ' +
      'L’équipe d’Amundsen, bien préparée et habituée aux régions polaires, atteignit le pôle le 14 décembre. Lorsque ' +
      'Scott et ses compagnons y arrivèrent, cinq semaines plus tard, ils découvrirent une tente surmontée du drapeau ' +
      'norvégien. Épuisés et déçus, ils entreprirent le long voyage du retour, au milieu d’un hiver précoce. Aujourd’hui, ' +
      'des chercheurs du monde entier vivent dans des bases scientifiques en Antarctique. Ils étudient la glace, qui garde ' +
      'la mémoire du climat depuis des centaines de milliers d’années.',
  },
  {
    id: 'cm2-abeilles',
    classe: 'CM2',
    titre: 'Le langage des abeilles',
    texte:
      'Une ruche peut abriter jusqu’à cinquante mille abeilles, qui vivent ensemble comme une véritable société. Chacune ' +
      'y occupe un rôle précis selon son âge : les plus jeunes nettoient les alvéoles et nourrissent les larves, tandis ' +
      'que les plus âgées partent butiner les fleurs des environs. Mais comment une abeille qui a découvert un champ de ' +
      'fleurs prévient-elle les autres ? Au milieu du vingtième siècle, le savant autrichien Karl von Frisch a résolu ce ' +
      'mystère. En observant patiemment des ruches vitrées, il a compris que les abeilles communiquent en dansant. ' +
      'Lorsque la nourriture est proche, l’abeille exécute une danse en rond. Lorsqu’elle est éloignée, elle trace un huit ' +
      'en remuant l’abdomen : l’angle de sa danse indique la direction des fleurs par rapport au soleil, et sa durée ' +
      'renseigne sur la distance à parcourir. Ses compagnes, serrées autour d’elle, perçoivent ses mouvements dans ' +
      'l’obscurité de la ruche. Cette découverte lui a valu le prix Nobel. Aujourd’hui, les abeilles sont menacées par ' +
      'les pesticides et la disparition des fleurs sauvages. Les protéger, c’est aussi protéger nos fruits et nos légumes, ' +
      'car une grande partie des plantes que nous mangeons dépend de leur travail.',
  },
  {
    id: 'cm2-tempete',
    classe: 'CM2',
    titre: 'La traversée',
    texte:
      'Le voilier quitta le port de Brest à l’aube, par une mer d’huile. À bord, Capy et son oncle avaient prévu de ' +
      'rejoindre l’île d’Ouessant avant midi. Pendant la première heure, tout se déroula parfaitement : les dauphins ' +
      'accompagnaient la coque en bondissant, et le soleil réchauffait le pont. Pourtant, vers dix heures, l’oncle fronça ' +
      'les sourcils en consultant le baromètre. La pression chutait rapidement. Au loin, une barre de nuages sombres ' +
      'avançait vers eux. « Il faut réduire la voilure », annonça-t-il calmement. Capy enfila son gilet de sauvetage et ' +
      'l’aida à rouler la grande voile. Bientôt, le vent se mit à hurler dans les haubans, et des vagues énormes ' +
      'soulevèrent le bateau comme une plume. Cramponné à la barre, l’oncle gardait le cap, tandis que Capy surveillait ' +
      'la boussole et annonçait les rochers. Après deux heures interminables, la silhouette du phare de l’île surgit ' +
      'enfin à travers la pluie. Quand ils accostèrent, trempés et épuisés, les marins du port les accueillirent avec ' +
      'une soupe brûlante. Ce soir-là, en écrivant dans son journal de bord, Capy nota que le courage ne consiste pas ' +
      'à ne jamais avoir peur, mais à garder son sang-froid quand la peur arrive.',
  },
];

export function textesDe(classe: Classe): TexteLecture[] {
  return TEXTES_LECTURE.filter((t) => t.classe === classe);
}

export function texteLecture(id: string): TexteLecture | undefined {
  return TEXTES_LECTURE.find((t) => t.id === id);
}
