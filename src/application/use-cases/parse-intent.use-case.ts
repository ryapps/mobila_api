// Application Layer - Use Case for parsing intent

import { Intent } from '../../domain/entities/intent';
import { IIntentParser } from '../../domain/interfaces/intent-parser.interface';

export interface ParseIntentRequest {
  text: string;
}

export interface ParseIntentResponse {
  intent: Intent;
}

export class ParseIntentUseCase {
  constructor(private readonly intentParser: IIntentParser) {}

  execute(request: ParseIntentRequest): ParseIntentResponse {
    if (!request.text || typeof request.text !== 'string') {
      throw new Error('Invalid input: text is required and must be a string');
    }

    const intent = this.intentParser.parse(request.text);

    return { intent };
  }
}
