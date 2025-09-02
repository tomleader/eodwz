// functions/api/login/index.js
async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  const { password } = await request.json().catch(() => ({}));
  const pass = env.ADMIN_PASS || '';
  if (!pass || password !== pass) {
    return new Response('Unauthorized', { status: 401 });
  }
  const token = await sha256Hex(pass);
  const headers = new Headers({ 'Content-Type': 'application/json' });
  // 30 天有效期
  headers.append('Set-Cookie', `auth=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);
  return new Response(JSON.stringify({ ok: true }), { headers });
}