export async function parseJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

export function sendJson(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    ...headers,
  });
  response.end(JSON.stringify(body, null, 2));
}

export function notFound(response) {
  sendJson(response, 404, { error: 'not_found', message: 'No route matched this request.' });
}

export function badRequest(response, message, details = {}) {
  sendJson(response, 400, { error: 'bad_request', message, ...details });
}

export function unauthorized(response) {
  sendJson(response, 401, {
    error: 'unauthorized',
    message: 'Pass a sandbox API key using Authorization: Bearer <key> or x-api-key.',
  });
}


export function getHeader(request, name) {
  const value = request.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value || '';
}
