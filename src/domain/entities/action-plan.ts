// Domain Entities - Action Plan

export interface ActionStep {
  type: ActionStepType;
  payload: Record<string, unknown>;
}

export type ActionStepType = 'SHOW_CONFIRMATION' | 'SHOW_RECOMMENDATION' | 'SHOW_ERROR' | 'SHOW_SUCCESS' | 'NAVIGATE_TO' | 'SPEAK_PROMPT';

export interface ActionPlan {
  planId: string;
  requiresConfirmation: boolean;
  steps: ActionStep[];
}

export interface ConfirmationPayload {
  destination: string;
  destinationType: string;
  vehicle: string;
  eta: string;
  urgency: string;
  accessibilityFeatures: string[];
}

export interface RecommendationPayload {
  context: string;
  options: RecommendationOption[];
}

export interface RecommendationOption {
  id: string;
  title: string;
  description: string;
  eta?: string;
  price?: string;
}

export interface ErrorPayload {
  message: string;
  recoverable: boolean;
  suggestedAction?: string;
}

export interface NavigationPayload {
  screen: string;
  params?: Record<string, unknown>;
}

export interface SpeakPayload {
  text: string;
  language: string;
}
