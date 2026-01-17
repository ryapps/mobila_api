import type { IncomingMessage, ServerResponse } from 'http';

import { createContainer } from '../src/container';

const container = createContainer();

function sendCorsHeaders(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = req.url || '/';
  const method = req.method || 'GET';
  const path = url.split('?')[0];

  if (method === 'OPTIONS') {
    sendCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    if ((path === '/api/health' || path === '/health') && method === 'GET') {
      await container.apiController.health(req, res);
      return;
    }

    if (path === '/api/voice' && method === 'POST') {
      await container.apiController.voice(req, res);
      return;
    }

    if (path === '/api/intent' && method === 'POST') {
      await container.apiController.intent(req, res);
      return;
    }

    if (path === '/api/decide' && method === 'POST') {
      await container.apiController.decide(req, res);
      return;
    }

    if (path === '/api/confirm' && method === 'POST') {
      await container.apiController.confirm(req, res);
      return;
    }

    if ((path === '/api/parse' || path === '/parse') && method === 'POST') {
      await container.apiController.parseIntent(req, res);
      return;
    }

    sendCorsHeaders(res);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Not found',
        availableEndpoints: ['/api/voice', '/api/intent', '/api/decide', '/api/confirm', '/api/parse', '/health'],
      }),
    );
  } catch (error) {
    console.error('Request error:', error);
    sendCorsHeaders(res);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
