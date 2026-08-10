import { validateTmdbPath } from '../_shared/tmdbPolicy.ts';

const TMDB_API_URL = 'https://api.themoviedb.org/3';
const defaultOrigins = [
  'https://ilynet-0302.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function environment(name: string) {
  return Deno.env.get(name)?.trim() || '';
}

function allowedOrigins() {
  return new Set((environment('ALLOWED_ORIGINS') || defaultOrigins.join(','))
    .split(',').map((origin) => origin.trim()).filter(Boolean));
}

function corsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
  if (origin && allowedOrigins().has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function jsonResponse(body: unknown, status: number, origin: string | null, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin), ...extraHeaders },
  });
}

function configuredPublishableKeys() {
  const keys = new Set<string>();
  const legacyKey = environment('SUPABASE_ANON_KEY');
  if (legacyKey) keys.add(legacyKey);

  const encodedKeys = environment('SUPABASE_PUBLISHABLE_KEYS');
  if (encodedKeys) {
    try {
      for (const value of Object.values(JSON.parse(encodedKeys))) {
        if (typeof value === 'string') keys.add(value);
      }
    } catch {
      // A malformed platform-provided value is handled as a failed authorization check.
    }
  }
  return keys;
}

function clientAddress(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return request.headers.get('cf-connecting-ip')?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || forwarded
    || 'unknown-client';
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function positiveInteger(name: string, fallback: number) {
  const value = Number(environment(name) || fallback);
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

async function consumeRateLimit(request: Request) {
  const supabaseUrl = environment('SUPABASE_URL');
  const serviceRoleKey = environment('SUPABASE_SERVICE_ROLE_KEY');
  const salt = environment('RATE_LIMIT_SALT');
  if (!supabaseUrl || !serviceRoleKey || !salt) throw new Error('Rate limiting is not configured.');

  const clientHash = await sha256(`${salt}:${clientAddress(request)}`);
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/consume_tmdb_rate_limit`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_client_hash: clientHash,
      p_minute_limit: positiveInteger('TMDB_RATE_LIMIT_PER_MINUTE', 120),
      p_daily_limit: positiveInteger('TMDB_RATE_LIMIT_PER_DAY', 2000),
    }),
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) throw new Error('Rate limit storage is unavailable.');
  return response.json() as Promise<boolean>;
}

function tmdbRequest(path: string) {
  const readToken = environment('TMDB_API_READ_TOKEN');
  const apiKey = environment('TMDB_API_KEY');
  if (!readToken && !apiKey) throw new Error('TMDB credentials are not configured.');

  const url = new URL(`${TMDB_API_URL}${path}`);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (readToken) headers.Authorization = `Bearer ${readToken}`;
  else url.searchParams.set('api_key', apiKey);
  return { url, headers };
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');
  if (!origin || !allowedOrigins().has(origin)) {
    return jsonResponse({ error: 'Origin is not allowed.' }, 403, origin);
  }

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405, origin);

  const suppliedApiKey = request.headers.get('apikey') || '';
  if (!suppliedApiKey || !configuredPublishableKeys().has(suppliedApiKey)) {
    return jsonResponse({ error: 'A valid Supabase publishable key is required.' }, 401, origin);
  }

  try {
    const body = await request.json() as { path?: unknown };
    const path = validateTmdbPath(body.path);

    if (!await consumeRateLimit(request)) {
      return jsonResponse({ error: 'Rate limit exceeded.' }, 429, origin, { 'Retry-After': '60' });
    }

    const upstream = tmdbRequest(path);
    const response = await fetch(upstream.url, {
      headers: upstream.headers,
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      if (response.status === 404) return jsonResponse({ error: 'TMDB resource not found.' }, 404, origin);
      if (response.status === 429) return jsonResponse({ error: 'TMDB rate limit reached.' }, 429, origin, { 'Retry-After': response.headers.get('retry-after') || '60' });
      return jsonResponse({ error: 'TMDB request failed.' }, 502, origin);
    }

    return new Response(await response.text(), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60',
        ...corsHeaders(origin),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected proxy error.';
    const isInvalidRequest = message.startsWith('Invalid TMDB') || message.includes('not allowed');
    console.error('TMDB proxy request failed:', message);
    return jsonResponse({ error: isInvalidRequest ? message : 'TMDB proxy is unavailable.' }, isInvalidRequest ? 400 : 503, origin);
  }
});
