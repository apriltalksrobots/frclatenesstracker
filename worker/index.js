// FRC Tools — TBA Proxy Worker
//
// Paste this into the Cloudflare Workers dashboard editor.
//
// After deploying, go to Settings → Variables → Secrets and add:
//   TBA_API_KEY = your TBA read API key
//
// Also update ALLOWED_ORIGIN below to your GitHub Pages URL.

const TBA_BASE = 'https://www.thebluealliance.com/api/v3';

// Set this to your GitHub Pages URL, e.g. https://YOUR_USERNAME.github.io
// Or use '*' to allow any origin (fine for a small internal tool)
const ALLOWED_ORIGIN = 'https://YOUR_USERNAME.github.io';

const ALLOWED_PREFIXES = ['/event/', '/team/', '/events/', '/teams/', '/district/', '/status'];

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
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

  const tbaKey = TBA_API_KEY; // injected from secret
  if (!tbaKey) {
    return jsonResponse({ error: 'TBA_API_KEY secret not configured' }, 500, corsHeaders(origin));
  }

  const tbaUrl = `${TBA_BASE}${pathname}${url.search}`;

  try {
    const tbaRes = await fetch(tbaUrl, {
      headers: {
        'X-TBA-Auth-Key': tbaKey,
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
}

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
