// Infrastructure Layer - Intent Parser Implementation

import { KEYWORDS } from '../../domain/constants/keywords';
import { AccessibilityNeed, GoToPlaceIntent, Intent, PlaceType, RecommendationContext, TimeConstraint, UrgencyLevel } from '../../domain/entities/intent';
import { IIntentParser } from '../../domain/interfaces/intent-parser.interface';

export class IntentParser implements IIntentParser {
  parse(userInput: string): Intent {
    const text = this.normalizeInput(userInput);

    // Priority order: Cancel > Confirm > Recommendation > GoToPlace
    if (this.isCancelIntent(text)) {
      return { intent: 'CANCEL_ACTION' };
    }

    if (this.isConfirmIntent(text) && !this.isGoToPlaceIntent(text) && !this.isRecommendationIntent(text)) {
      return { intent: 'CONFIRM_ACTION' };
    }

    if (this.isRecommendationIntent(text)) {
      return {
        intent: 'REQUEST_RECOMMENDATION',
        context: this.detectRecommendationContext(text),
      };
    }

    if (this.isGoToPlaceIntent(text)) {
      return this.buildGoToPlaceIntent(text);
    }

    // Unknown intent when no keyword match
    return { intent: 'UNKNOWN' };
  }

  private normalizeInput(input: string): string {
    return input.toLowerCase().trim();
  }

  private containsAny(text: string, keywords: readonly string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword));
  }

  private isCancelIntent(text: string): boolean {
    return this.containsAny(text, KEYWORDS.cancel);
  }

  private isConfirmIntent(text: string): boolean {
    const normalized = text.replace(/[^a-zA-Z\s]/g, '').trim();
    return KEYWORDS.confirm.some((keyword) => {
      const pattern = new RegExp(`^${keyword}$|^${keyword}\\s|\\s${keyword}$`, 'i');
      return pattern.test(normalized) || normalized === keyword;
    });
  }

  private isRecommendationIntent(text: string): boolean {
    const contextKeywords = [...KEYWORDS.transport, ...KEYWORDS.route, ...KEYWORDS.time];
    return this.containsAny(text, KEYWORDS.recommendation) || (this.containsAny(text, KEYWORDS.question) && this.containsAny(text, contextKeywords));
  }

  private isGoToPlaceIntent(text: string): boolean {
    const placeKeywords = [...KEYWORDS.hospital, ...KEYWORDS.office, ...KEYWORDS.school];
    const hasPlaceKeyword = this.containsAny(text, placeKeywords);
    if (hasPlaceKeyword) {
      return true;
    }

    // Avoid triggering GO_TO_PLACE on generic phrases without place keywords
    return false;
  }

  private detectPlaceType(text: string): PlaceType {
    if (this.containsAny(text, KEYWORDS.hospital)) return 'hospital';
    if (this.containsAny(text, KEYWORDS.office)) return 'office';
    if (this.containsAny(text, KEYWORDS.school)) return 'school';
    return 'other';
  }

  private detectUrgency(text: string): UrgencyLevel {
    if (this.containsAny(text, KEYWORDS.highUrgency)) return 'high';
    if (this.containsAny(text, KEYWORDS.mediumUrgency)) return 'medium';
    return 'medium';
  }

  private detectTimeConstraint(text: string): TimeConstraint {
    if (this.containsAny(text, KEYWORDS.scheduled)) return 'scheduled';
    if (this.containsAny(text, KEYWORDS.now)) return 'now';
    return 'now';
  }

  private detectAccessibilityNeeds(text: string): AccessibilityNeed[] {
    const needs: AccessibilityNeed[] = [];
    if (this.containsAny(text, KEYWORDS.wheelchair)) needs.push('wheelchair');
    if (this.containsAny(text, KEYWORDS.assistant)) needs.push('assistant');
    if (this.containsAny(text, KEYWORDS.stretcher)) needs.push('stretcher');
    return needs;
  }

  private detectRecommendationContext(text: string): RecommendationContext {
    if (this.containsAny(text, KEYWORDS.transport)) return 'transport';
    if (this.containsAny(text, KEYWORDS.route)) return 'route';
    if (this.containsAny(text, KEYWORDS.time)) return 'time';
    return 'transport';
  }

  private extractPlaceName(text: string): string | null {
    const patterns = [/ke\s+(?:rumah sakit|rs)\s+(\w+(?:\s+\w+)*)/i, /ke\s+(?:kantor)\s+(\w+(?:\s+\w+)*)/i, /ke\s+(?:sekolah|kampus)\s+(\w+(?:\s+\w+)*)/i, /ke\s+(\w+(?:\s+\w+)*)\s+(?:hospital|mall|plaza)/i];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  private buildGoToPlaceIntent(text: string): GoToPlaceIntent {
    const urgency = this.detectUrgency(text);
    const emergencyKeywords = ['igd', 'darurat', 'emergency'];
    const finalUrgency = this.containsAny(text, emergencyKeywords) ? 'high' : urgency;

    return {
      intent: 'GO_TO_PLACE',
      place_type: this.detectPlaceType(text),
      place_name: this.extractPlaceName(text),
      urgency: finalUrgency,
      time_constraint: this.detectTimeConstraint(text),
      accessibility_needs: this.detectAccessibilityNeeds(text),
    };
  }

  // No default GO_TO_PLACE intent to avoid false confirmations
}
