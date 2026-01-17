// Presentation Layer - API Controller
// Handles all API endpoints following the architecture: /api/voice, /api/intent, /api/decide, /api/confirm

import * as http from 'http';
import { ActionPlanResponseDto, ConfirmRequestDto, DecideRequestDto, VoiceRequestDto } from '../../application/dtos/api.dto';
import { ParseIntentRequestDto } from '../../application/dtos/intent.dto';
import { DecisionEngineUseCase } from '../../application/use-cases/decision-engine.use-case';
import { ParseIntentUseCase } from '../../application/use-cases/parse-intent.use-case';
import { GoToPlaceIntent, Intent, RequestRecommendationIntent } from '../../domain/entities/intent';
import { parseRequestBody } from '../../infrastructure/http/request-parser';

export class ApiController {
  constructor(
    private readonly parseIntentUseCase: ParseIntentUseCase,
    private readonly decisionEngine: DecisionEngineUseCase,
  ) {}

  /**
   * POST /api/voice
   * Receives audio/text and returns transcript
   * In production: integrate with Speech-to-Text service
   */
  async voice(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    try {
      const body = await parseRequestBody<VoiceRequestDto>(req);

      // For now, we accept text directly (STT would be handled here in production)
      if (!body.text) {
        this.sendJson(res, 400, { error: 'Missing "text" field. Audio processing not implemented yet.' });
        return;
      }

      this.sendJson(res, 200, {
        transcript: body.text,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      this.sendJson(res, 400, { error: message });
    }
  }

  /**
   * POST /api/intent
   * Parses text into structured intent
   */
  async intent(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
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

  /**
   * POST /api/decide
   * Takes intent and returns action plan for Flutter to execute
   */
  async decide(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    try {
      const body = await parseRequestBody<DecideRequestDto>(req);

      if (!body.userId || !body.intent) {
        this.sendJson(res, 400, { error: 'Missing "userId" or "intent" field' });
        return;
      }

      // Reconstruct intent from payload
      const intent = this.reconstructIntent(body.intent, body.payload);

      const result = this.decisionEngine.execute({
        userId: body.userId,
        intent,
      });

      const response: ActionPlanResponseDto = {
        planId: result.plan.planId,
        requiresConfirmation: result.plan.requiresConfirmation,
        steps: result.plan.steps.map((step) => ({
          type: step.type,
          payload: step.payload,
        })),
      };

      this.sendJson(res, 200, response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      this.sendJson(res, 400, { error: message });
    }
  }

  /**
   * POST /api/confirm
   * Confirms or cancels a pending action plan
   */
  async confirm(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    try {
      const body = await parseRequestBody<ConfirmRequestDto>(req);

      if (!body.planId || typeof body.confirmed !== 'boolean') {
        this.sendJson(res, 400, { error: 'Missing "planId" or "confirmed" field' });
        return;
      }

      const fallbackIntent = this.buildFallbackIntent(body.confirmationPayload);
      const plan = this.decisionEngine.confirmPlan(body.planId, body.confirmed, fallbackIntent);

      const response: ActionPlanResponseDto = {
        planId: plan.planId,
        requiresConfirmation: plan.requiresConfirmation,
        steps: plan.steps.map((step) => ({
          type: step.type,
          payload: step.payload,
        })),
      };

      this.sendJson(res, 200, response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      this.sendJson(res, 400, { error: message });
    }
  }

  private buildFallbackIntent(payload?: Record<string, unknown>): Intent | undefined {
    if (!payload) return undefined;

    const destination = payload['destination'];
    const destinationType = payload['destinationType'];
    const urgency = payload['urgency'];
    const accessibilityFeatures = payload['accessibilityFeatures'];

    if (typeof destinationType !== 'string') {
      return undefined;
    }

    return {
      intent: 'GO_TO_PLACE',
      place_type: destinationType as any,
      place_name: typeof destination === 'string' ? destination : null,
      urgency: typeof urgency === 'string' ? urgency : 'medium',
      time_constraint: 'now',
      accessibility_needs: Array.isArray(accessibilityFeatures) ? (accessibilityFeatures as string[]) : [],
    } as GoToPlaceIntent;
  }

  /**
   * GET /health
   * Health check endpoint
   */
  async health(_req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    this.sendJson(res, 200, {
      status: 'ok',
      service: 'mobila-intent-api',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      endpoints: ['/api/voice', '/api/intent', '/api/decide', '/api/confirm'],
    });
  }

  /**
   * Legacy: POST /parse (backward compatibility)
   */
  async parseIntent(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    return this.intent(req, res);
  }

  private reconstructIntent(intentType: string, payload: Record<string, unknown>): Intent {
    switch (intentType) {
      case 'GO_TO_PLACE':
        return {
          intent: 'GO_TO_PLACE',
          place_type: (payload.place_type as string) || 'other',
          place_name: (payload.place_name as string | null) || null,
          urgency: (payload.urgency as string) || 'medium',
          time_constraint: (payload.time_constraint as string) || 'now',
          accessibility_needs: (payload.accessibility_needs as string[]) || [],
        } as GoToPlaceIntent;

      case 'REQUEST_RECOMMENDATION':
        return {
          intent: 'REQUEST_RECOMMENDATION',
          context: (payload.context as string) || 'transport',
        } as RequestRecommendationIntent;

      case 'CONFIRM_ACTION':
        return { intent: 'CONFIRM_ACTION' };

      case 'CANCEL_ACTION':
        return { intent: 'CANCEL_ACTION' };

      case 'UNKNOWN':
        return { intent: 'UNKNOWN' };

      default:
        throw new Error(`Unknown intent type: ${intentType}`);
    }
  }

  private sendJson(res: http.ServerResponse, statusCode: number, data: object): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
}
