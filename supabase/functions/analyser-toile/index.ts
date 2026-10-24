// Edge Function « analyser-toile ».
//
// Reçoit UNIQUEMENT la zone de la toile, déjà recadrée sur le téléphone, et la
// liste des domaines de la classe. Demande à Claude (vision) de lire le niveau de
// chaque axe et renvoie seulement un JSON de niveaux.
//
// Données : l'image n'est jamais enregistrée (ni base, ni stockage, ni journal).
// Elle ne vit qu'en mémoire le temps de la requête.
//
// Secrets (supabase secrets set ...) :
//   ANTHROPIC_API_KEY   clé de l'API Claude (jamais dans l'appli)
//   CLAUDE_MODELE       facultatif, modèle à utiliser (défaut : claude-sonnet-5-5)
import Anthropic from 'npm:@anthropic-ai/sdk@0.133.0';
import { withSupabase } from 'npm:@supabase/server@1.9.2';
import { z } from 'npm:zod@4.6.7';

const MODELE_PAR_DEFAUT = 'claude-sonnet-5-5';
/** Taille maximale de l'image reçue (en caractères base64, environ 1,5 Mo). */
const TAILLE_MAX_BASE64 = 2_000_000;

const Requete = z.object({
  image: z.string().min(100).max(TAILLE_MAX_BASE64),
  typeImage: z.enum(['image/jpeg', 'image/png']),
  domaines: z
    .array(z.object({ id: z.string().regex(/^[a-z-]+$/).max(40), libelle: z.string().min(1).max(60) }))
    .min(3)
    .max(10),
});

const Reponse = z.object({
  domaines: z.array(z.object({ id: z.string(), niveau: z.number().min(0).max(1) })),
  confiance: z.number().min(0).max(1),
});

const SYSTEME = `Tu lis des graphiques radar (« toiles ») issus des fiches de résultats des évaluations nationales françaises de mathématiques (CP au CM2).

Pour chaque axe demandé, estime le niveau du point de l'élève : 0 au centre, 1 sur le contour extérieur, en t'aidant des cercles ou polygones de graduation. Arrondis au dixième.

Associe chaque axe au domaine demandé dont le libellé correspond, même si l'intitulé imprimé diffère un peu. Si un axe demandé est introuvable, donne ta meilleure estimation et baisse la confiance.

La confiance (0 à 1) reflète ta certitude globale : image floue, coupée, de travers ou autre chose qu'une toile → confiance basse (0 si ce n'est pas une toile).

Ne recopie jamais de nom, de prénom, d'école ni aucune autre information personnelle visible : réponds uniquement avec les niveaux demandés.`;

function json(corps: unknown, statut = 200): Response {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

export default {
  fetch: withSupabase({ auth: 'publishable' }, async (req) => {
    if (req.method !== 'POST') return json({ erreur: 'methode' }, 405);

    let requete: z.infer<typeof Requete>;
    try {
      const lue = Requete.safeParse(await req.json());
      if (!lue.success) return json({ erreur: 'requete_invalide' }, 400);
      requete = lue.data;
    } catch {
      return json({ erreur: 'requete_invalide' }, 400);
    }

    const ids = requete.domaines.map((d) => d.id);
    const schema = {
      type: 'object',
      properties: {
        domaines: {
          type: 'array',
          items: {
            type: 'object',
            properties: { id: { type: 'string', enum: ids }, niveau: { type: 'number' } },
            required: ['id', 'niveau'],
            additionalProperties: false,
          },
        },
        confiance: { type: 'number' },
      },
      required: ['domaines', 'confiance'],
      additionalProperties: false,
    };

    try {
      const message = await client.beta.messages.create({
        model: Deno.env.get('CLAUDE_MODELE') || MODELE_PAR_DEFAUT,
        max_tokens: 16000,
        // Si un filtre de sécurité refuse l'image par erreur, la requête est
        // rejouée automatiquement sur un autre modèle plutôt que d'échouer.
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: SYSTEME,
        output_config: { format: { type: 'json_schema', schema } },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: requete.typeImage, data: requete.image } },
              {
                type: 'text',
                text: `Axes à lire (id : libellé) :\n${requete.domaines.map((d) => `- ${d.id} : ${d.libelle}`).join('\n')}`,
              },
            ],
          },
        ],
      });

      if (message.stop_reason === 'refusal') return json({ erreur: 'refus' }, 422);
      if (message.stop_reason === 'max_tokens') return json({ erreur: 'reponse_incomplete' }, 502);

      const texte = message.content.find((b) => b.type === 'text');
      if (!texte || texte.type !== 'text') return json({ erreur: 'reponse_vide' }, 502);

      const resultat = Reponse.safeParse(JSON.parse(texte.text));
      if (!resultat.success) return json({ erreur: 'reponse_invalide' }, 502);

      // On ne renvoie que les domaines demandés, une seule fois chacun.
      const vus = new Set<string>();
      const domaines = resultat.data.domaines.filter((d) => ids.includes(d.id) && !vus.has(d.id) && vus.add(d.id));
      return json({ domaines, confiance: resultat.data.confiance });
    } catch (erreur) {
      if (erreur instanceof Anthropic.RateLimitError) return json({ erreur: 'occupe' }, 503);
      if (erreur instanceof Anthropic.BadRequestError) return json({ erreur: 'image_refusee' }, 422);
      if (erreur instanceof Anthropic.APIError) {
        console.error(`Erreur API Claude ${erreur.status}`);
        return json({ erreur: 'service' }, 502);
      }
      // JSON illisible ou autre : on ne journalise jamais le contenu de la requête.
      console.error('Erreur inattendue', erreur instanceof Error ? erreur.name : 'inconnue');
      return json({ erreur: 'service' }, 500);
    }
  }),
};
