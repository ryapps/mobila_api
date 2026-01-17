// Application Entry Point - Dependency Injection & Bootstrap

import { DecisionEngineUseCase } from './application/use-cases/decision-engine.use-case';
import { ParseIntentUseCase } from './application/use-cases/parse-intent.use-case';
import { HttpServer } from './infrastructure/http/server';
import { IntentParser } from './infrastructure/parsers/intent-parser';
import { ApiController } from './presentation/controllers/api.controller';

// Configuration
const config = {
  port: parseInt(process.env.PORT || '8000', 10),
};

// Dependency Injection Container
function createContainer() {
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

// CLI Mode
function runCli(args: string[]): void {
  const container = createContainer();
  const userInput = args.join(' ');
  const result = container.parseIntentUseCase.execute({ text: userInput });
  console.log(JSON.stringify(result.intent));
}

// Server Mode
async function runServer(): Promise<void> {
  const container = createContainer();
  await container.httpServer.start();
}

// Main Entry
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length > 0 && args[0] !== '--server') {
    // CLI mode
    runCli(args);
  } else {
    // Server mode
    await runServer();
  }
}

main().catch(console.error);

// Exports for testing
export { createContainer };
