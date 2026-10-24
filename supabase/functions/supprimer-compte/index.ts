// Edge Function « supprimer-compte ».
//
// Supprime le compte du parent connecté. Les profils enfants enregistrés sur le
// serveur disparaissent avec lui (clé étrangère « on delete cascade »).
// Les données restent sur l'appareil tant que le parent ne supprime pas aussi
// les profils dans l'appli.
import { withSupabase } from 'npm:@supabase/server@1.9.2';

function json(corps: unknown, statut = 200): Response {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return json({ erreur: 'methode' }, 405);
    const id = ctx.userClaims?.id;
    if (!id) return json({ erreur: 'non_connecte' }, 401);

    // Par sécurité, on efface explicitement les profils avant le compte.
    const { error: erreurProfils } = await ctx.supabaseAdmin.from('profils_enfants').delete().eq('parent_id', id);
    if (erreurProfils) return json({ erreur: 'suppression_profils' }, 500);

    const { error } = await ctx.supabaseAdmin.auth.admin.deleteUser(id);
    if (error) return json({ erreur: 'suppression_compte' }, 500);
    return json({ ok: true });
  }),
};
