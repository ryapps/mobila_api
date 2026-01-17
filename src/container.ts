// Dependency Injection Container (no side effects)

import { DecisionEngineUseCase } from './application/use-cases/decision-engine.use-case';
import { ParseIntentUseCase } from './application/use-cases/parse-intent.use-case';
import { HttpServer } from './infrastructure/http/server';
import { IntentParser } from './infrastructure/parsers/intent-parser';
import { ApiController } from './presentation/controllers/api.controller';

// Configuration
const config = {
  port: parseInt(process.env.PORT || '8000', 10),
};

export function createContainer() {
  // Infrastructure
  const intentParser = new IntentParser();

  // Application
  const parseIntentUseCase = new ParseIntentUseCase(intentParser);
  const decisionEngine = new DecisionEngineUseCase();

  // Presentation
  const apiController = new ApiController(parseIntentUseCase, decisionEngine);

  // Server
  const httpServer = new HttpServer(apiController, { port: config.port });

  return {
    intentParser,
    parseIntentUseCase,
    decisionEngine,
    apiController,
    httpServer,
  };
}
