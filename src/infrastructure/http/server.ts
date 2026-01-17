// Infrastructure Layer - HTTP Server

import * as http from 'http';
import { ApiController } from '../../presentation/controllers/api.controller';

export interface ServerConfig {
  port: number;
}

export class HttpServer {
  private server: http.Server | null = null;

  constructor(
    private readonly controller: ApiController,
    private readonly config: ServerConfig,
  ) {}

  async start(): Promise<void> {
    this.server = http.createServer((req, res) => this.handleRequest(req, res));

    return new Promise((resolve) => {
      this.server!.listen(this.config.port, () => {
        console.log(`\n🚀 Mobila Intent API running on port ${this.config.port}`);
        console.log(`\nEndpoints:`);
        console.log(`  POST /api/voice   - Send voice/text, get transcript`);
        console.log(`  POST /api/intent  - Parse intent from text`);
        console.log(`  POST /api/decide  - Get action plan from intent`);
        console.log(`  POST /api/confirm - Confirm/cancel action plan`);
        console.log(`  GET  /health      - Health check`);
        console.log(`  POST /parse       - (Legacy) Parse intent`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = req.url || '/';
    const method = req.method || 'GET';

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      this.sendCorsHeaders(res);
      res.writeHead(204);
      res.end();
      return;
    }

    // Route requests
    try {
      // Health check
      if (url === '/health' && method === 'GET') {
        await this.controller.health(req, res);
        return;
      }

      // API endpoints
      if (url === '/api/voice' && method === 'POST') {
        await this.controller.voice(req, res);
        return;
      }

      if (url === '/api/intent' && method === 'POST') {
        await this.controller.intent(req, res);
        return;
      }

      if (url === '/api/decide' && method === 'POST') {
        await this.controller.decide(req, res);
        return;
      }

      if (url === '/api/confirm' && method === 'POST') {
        await this.controller.confirm(req, res);
        return;
      }

      // Legacy endpoint (backward compatibility)
      if (url === '/parse' && method === 'POST') {
        await this.controller.parseIntent(req, res);
        return;
      }

      // 404 for unknown routes
      this.sendJson(res, 404, { error: 'Not found', availableEndpoints: ['/api/voice', '/api/intent', '/api/decide', '/api/confirm', '/health'] });
    } catch (error) {
      console.error('Request error:', error);
      this.sendJson(res, 500, { error: 'Internal server error' });
    }
  }

  private sendCorsHeaders(res: http.ServerResponse): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  private sendJson(res: http.ServerResponse, statusCode: number, data: object): void {
    this.sendCorsHeaders(res);
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
}
