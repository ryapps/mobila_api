// Application DTOs for API endpoints

export interface VoiceRequestDto {
  audio?: Buffer;
  text?: string;
}

export interface VoiceResponseDto {
  transcript: string;
}

export interface IntentRequestDto {
  text: string;
}

export interface DecideRequestDto {
  userId: string;
  intent: string;
  payload: Record<string, unknown>;
}

export interface ConfirmRequestDto {
  planId: string;
  confirmed: boolean;
}

export interface ActionPlanResponseDto {
  planId: string;
  requiresConfirmation: boolean;
  steps: ActionStepDto[];
}

export interface ActionStepDto {
  type: string;
  payload: Record<string, unknown>;
}
