// Presentation Layer - Intent Controller

import * as http from 'http';
import { ParseIntentRequestDto } from '../../application/dtos/intent.dto';
import { ParseIntentUseCase } from '../../application/use-cases/parse-intent.use-case';
import { parseRequestBody } from '../../infrastructure/http/request-parser';

export class IntentController {
  constructor(private readonly parseIntentUseCase: ParseIntentUseCase) {}

  async parseIntent(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    try {
      const body = await parseRequestBody<ParseIntentRequestDto>(req);

      if (!body.text || typeof body.text !== 'string') {
        this.sendJson(res, 400, { error: 'Missing or invalid "text" field' });
        return;
      }

      const result = this.parseIntentUseCase.execute({ text: body.text });
      this.sendJson(res, 200, result.intent);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      this.sendJson(res, 400, { error: message });
    }
  }

  async health(_req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    this.sendJson(res, 200, {
      status: 'ok',
      service: 'intent-interpreter',
      timestamp: new Date().toISOString(),
    });
  }

  private sendJson(res: http.ServerResponse, statusCode: number, data: object): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
}
