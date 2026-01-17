// Domain Entities - Core business objects

export interface GoToPlaceIntent {
  intent: 'GO_TO_PLACE';
  place_type: PlaceType;
  place_name: string | null;
  urgency: UrgencyLevel;
  time_constraint: TimeConstraint;
  accessibility_needs: AccessibilityNeed[];
}

export interface RequestRecommendationIntent {
  intent: 'REQUEST_RECOMMENDATION';
  context: RecommendationContext;
}

export interface ConfirmActionIntent {
  intent: 'CONFIRM_ACTION';
}

export interface CancelActionIntent {
  intent: 'CANCEL_ACTION';
}

export interface UnknownIntent {
  intent: 'UNKNOWN';
}

export type Intent = GoToPlaceIntent | RequestRecommendationIntent | ConfirmActionIntent | CancelActionIntent | UnknownIntent;

export type IntentType = 'GO_TO_PLACE' | 'REQUEST_RECOMMENDATION' | 'CONFIRM_ACTION' | 'CANCEL_ACTION' | 'UNKNOWN';

export type PlaceType = 'hospital' | 'office' | 'school' | 'other';
export type UrgencyLevel = 'low' | 'medium' | 'high';
export type TimeConstraint = 'now' | 'scheduled';
export type AccessibilityNeed = 'wheelchair' | 'assistant' | 'stretcher';
export type RecommendationContext = 'transport' | 'route' | 'time';
