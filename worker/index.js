/**
 * FRC Tools — TBA Proxy Worker
 *
 * Proxies requests to The Blue Alliance API, injecting the API key
 * from an environment secret so clients don't need their own key.
 *
 * Deploy with:
 *   npx wrangler deploy
 *
 * Set your TBA key as a secret:
 *   npx wrangler secret put TBA_API_KEY
 */

const TBA_BASE = 'https://www.thebluealliance.com/api/v3';

// Only allow these path prefixes through — keeps the proxy narrow
const ALLOWED_PREFIXES = [
  '/event/',
  '/team/',
  '/events/',
  '/teams/',
  '/district/',
  '/status',
];

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    // Only allow GET
    if (request.method !== 'GET') {
      return corsResponse(JSON.stringify({ error: 'Method not allowed' }), 405);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Validate the path is something we want to proxy
    const allowed = ALLOWED_PREFIXES.some(p => path.startsWith(p));
    if (!allowed) {
      return corsResponse(JSON.stringify({ error: 'Path not permitted' }), 403);
    }

    // Forward query params too
    const tbaUrl = `${TBA_BASE}${path}${url.search}`;

    try {
      const tbaRes = await fetch(tbaUrl, {
        headers: {
          'X-TBA-Auth-Key': env.TBA_API_KEY,
          'Accept': 'application/json',
        },
      });

      const body = await tbaRes.text();
      return corsResponse(body, tbaRes.status, {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30', // cache 30s at edge
      });
    } catch (e) {
      return corsResponse(JSON.stringify({ error: 'Upstream error', detail: e.message }), 502);
    }
  },
};

function corsResponse(body, status = 200, extra = {}) {
  return new Response(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...extra,
    },
  });
}
