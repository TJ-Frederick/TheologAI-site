export async function onRequest(context) {
  let response;
  try {
    response = await context.next();
  } catch (error) {
    console.error(JSON.stringify({ event: 'api_request_failed', error: error?.name || 'UnknownError' }));
    response = Response.json({ error: 'Request failed' }, { status: 500 });
  }
  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Strict-Transport-Security', 'max-age=15552000');
  headers.set('Cache-Control', 'no-store');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
