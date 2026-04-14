/**
 * FRC Tools — TBA Proxy Worker
 *
 * Proxies requests to The Blue Alliance API, injecting the TBA API key
 * from an environment secret so end users don't need their own key.
 *
 * Setup:
 *   1. npx wrangler deploy
 *   2. npx wrangler secret put TBA_API_KEY
 *   3. Set ALLOWED_ORIGIN below to your GitHub Pages URL
 */

const TBA_BASE = 'https://www.thebluealliance.com/api/v3';

// Set this to your GitHub Pages URL, e.g. https://YOUR_USERNAME.github.io
// Use '*' to allow any origin (less secure but fine for a small tool)
const ALLOWED_ORIGIN = 'https://YOUR_USERNAME.github.io';

const ALLOWED_PREFIXES = ['/event/', '/team/', '/events/', '/teams/', '/district/', '/status'];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGIN === '*' || origin === ALLOWED_ORIGIN || origin.startsWith(ALLOWED_ORIGIN);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(isAllowed ? origin : ALLOWED_ORIGIN),
      });
    }

    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders(ALLOWED_ORIGIN));
    }

    if (!isAllowed) {
      return jsonResponse({ error: 'Origin not allowed' }, 403, corsHeaders(ALLOWED_ORIGIN));
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    if (!ALLOWED_PREFIXES.some(p => pathname.startsWith(p))) {
      return jsonResponse({ error: 'Path not permitted' }, 403, corsHeaders(origin));
    }

    if (!env.TBA_API_KEY) {
      return jsonResponse({ error: 'TBA_API_KEY secret not configured on worker' }, 500, corsHeaders(origin));
    }

    const tbaUrl = `${TBA_BASE}${pathname}${url.search}`;

    try {
      const tbaRes = await fetch(tbaUrl, {
        headers: {
          'X-TBA-Auth-Key': env.TBA_API_KEY,
          'Accept': 'application/json',
        },
      });
      const body = await tbaRes.text();
      return new Response(body, {
        status: tbaRes.status,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30',
          ...corsHeaders(origin),
        },
      });
    } catch (e) {
      return jsonResponse({ error: 'Upstream error', detail: e.message }, 502, corsHeaders(origin));
    }
  },
};

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}
