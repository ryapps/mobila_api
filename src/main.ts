// Application Entry Point - Dependency Injection & Bootstrap

import { createContainer } from './container';

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
