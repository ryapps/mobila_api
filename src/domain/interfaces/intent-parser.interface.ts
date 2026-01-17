// Domain Interface - Contract for intent parsing

import { Intent } from '../entities/intent';

export interface IIntentParser {
  parse(userInput: string): Intent;
}
