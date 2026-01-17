// Application Layer - Data Transfer Objects

export interface ParseIntentRequestDto {
  text: string;
}

export interface ParseIntentResponseDto {
  intent: string;
  place_type?: string;
  place_name?: string | null;
  urgency?: string;
  time_constraint?: string;
  accessibility_needs?: string[];
  context?: string;
}

export interface ErrorResponseDto {
  error: string;
}

export interface HealthResponseDto {
  status: string;
  service: string;
  timestamp: string;
}
