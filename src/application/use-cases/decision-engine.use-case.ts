// Application Layer - Decision Engine Use Case

import { ActionPlan, ActionStep, ConfirmationPayload, RecommendationPayload } from '../../domain/entities/action-plan';
import { GoToPlaceIntent, Intent, RequestRecommendationIntent } from '../../domain/entities/intent';

export interface DecideRequest {
  userId: string;
  intent: Intent;
}

export interface DecideResponse {
  plan: ActionPlan;
}

export class DecisionEngineUseCase {
  private pendingPlans: Map<string, { intent: Intent; userId: string }> = new Map();

  execute(request: DecideRequest): DecideResponse {
    const planId = this.generatePlanId();
    const plan = this.createPlanFromIntent(planId, request.intent);

    // Store for confirmation
    if (plan.requiresConfirmation) {
      this.pendingPlans.set(planId, {
        intent: request.intent,
        userId: request.userId,
      });
    }

    return { plan };
  }

  confirmPlan(planId: string, confirmed: boolean, fallbackIntent?: Intent): ActionPlan {
    const pending = this.pendingPlans.get(planId);

    if (pending) {
      this.pendingPlans.delete(planId);

      if (!confirmed) {
        return this.createCancelledPlan();
      }

      return this.createExecutionPlan(pending.intent);
    }

    if (!confirmed) {
      return this.createCancelledPlan();
    }

    if (fallbackIntent) {
      return this.createExecutionPlan(fallbackIntent);
    }

    return this.createErrorPlan('Plan tidak ditemukan atau sudah kedaluwarsa.');
  }

  getPendingPlan(planId: string): { intent: Intent; userId: string } | undefined {
    return this.pendingPlans.get(planId);
  }

  private generatePlanId(): string {
    return `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createPlanFromIntent(planId: string, intent: Intent): ActionPlan {
    switch (intent.intent) {
      case 'GO_TO_PLACE':
        return this.createGoToPlacePlan(planId, intent);

      case 'REQUEST_RECOMMENDATION':
        return this.createRecommendationPlan(planId, intent);

      case 'CONFIRM_ACTION':
        return {
          planId,
          requiresConfirmation: false,
          steps: [
            {
              type: 'SPEAK_PROMPT',
              payload: { text: 'Tidak ada aksi yang perlu dikonfirmasi.', language: 'id-ID' },
            },
          ],
        };

      case 'CANCEL_ACTION':
        return this.createCancelledPlan();

      case 'UNKNOWN':
        return this.createErrorPlan('Saya tidak memahami maksud Anda.');

      default:
        return this.createErrorPlan('Intent tidak dikenali.');
    }
  }

  private createGoToPlacePlan(planId: string, intent: GoToPlaceIntent): ActionPlan {
    const destination = this.resolveDestination(intent);
    const vehicle = this.selectVehicle(intent);
    const eta = this.estimateETA(intent);
    const price = this.estimatePrice(eta, intent.urgency);

    const confirmationPayload: ConfirmationPayload = {
      destination: destination.name,
      destinationAddress: destination.address,
      destinationType: intent.place_type,
      vehicle: vehicle.name,
      eta: `${eta} menit`,
      urgency: intent.urgency,
      accessibilityFeatures: intent.accessibility_needs,
      price: this.formatCurrency(price),
      paymentMethod: 'Tunai',
    };

    const steps: ActionStep[] = [
      {
        type: 'SPEAK_PROMPT',
        payload: {
          text: `Saya akan mencarikan ${vehicle.name} ke ${destination.name}. Estimasi ${eta} menit. Konfirmasi untuk melanjutkan.`,
          language: 'id-ID',
        },
      },
      {
        type: 'SHOW_CONFIRMATION',
        payload: { confirmationPayload },
      },
    ];

    return {
      planId,
      requiresConfirmation: true,
      steps,
    };
  }

  private createRecommendationPlan(planId: string, intent: RequestRecommendationIntent): ActionPlan {
    const recommendations = this.getRecommendations(intent.context);

    const payload: RecommendationPayload = {
      context: intent.context,
      options: recommendations,
    };

    const speakText = this.buildRecommendationSpeech(intent.context, recommendations);

    return {
      planId,
      requiresConfirmation: false,
      steps: [
        {
          type: 'SPEAK_PROMPT',
          payload: { text: speakText, language: 'id-ID' },
        },
        {
          type: 'SHOW_RECOMMENDATION',
          payload: { payload },
        },
      ],
    };
  }

  private createExecutionPlan(intent: Intent): ActionPlan {
    if (intent.intent !== 'GO_TO_PLACE') {
      return this.createErrorPlan('Hanya GO_TO_PLACE yang bisa dieksekusi.');
    }

    const rideId = `ride-${Date.now()}`;

    return {
      planId: rideId,
      requiresConfirmation: false,
      steps: [
        {
          type: 'SPEAK_PROMPT',
          payload: { text: 'Baik, saya carikan kendaraan untuk Anda.', language: 'id-ID' },
        },
        {
          type: 'SHOW_SUCCESS',
          payload: { message: 'Mencari kendaraan...' },
        },
        {
          type: 'NAVIGATE_TO',
          payload: { screen: 'tracking', params: { rideId } },
        },
      ],
    };
  }

  private createCancelledPlan(): ActionPlan {
    return {
      planId: 'cancelled',
      requiresConfirmation: false,
      steps: [
        {
          type: 'SPEAK_PROMPT',
          payload: { text: 'Baik, saya batalkan.', language: 'id-ID' },
        },
        {
          type: 'NAVIGATE_TO',
          payload: { screen: 'home' },
        },
      ],
    };
  }

  private createErrorPlan(message: string): ActionPlan {
    return {
      planId: 'error',
      requiresConfirmation: false,
      steps: [
        {
          type: 'SPEAK_PROMPT',
          payload: { text: message, language: 'id-ID' },
        },
        {
          type: 'SHOW_ERROR',
          payload: { message, recoverable: true },
        },
      ],
    };
  }

  private resolveDestination(intent: GoToPlaceIntent): { name: string; address: string } {
    if (intent.place_name) {
      return { name: intent.place_name, address: 'Alamat akan ditentukan' };
    }

    const defaultNames: Record<string, string> = {
      hospital: 'RS terdekat',
      office: 'Kantor',
      school: 'Sekolah',
      other: 'Lokasi tujuan',
    };

    return {
      name: defaultNames[intent.place_type] || 'Lokasi tujuan',
      address: 'Alamat akan ditentukan',
    };
  }

  private selectVehicle(intent: GoToPlaceIntent): { name: string; type: string } {
    // Select vehicle based on accessibility needs
    if (intent.accessibility_needs.includes('wheelchair')) {
      return { name: 'Mobil akses kursi roda', type: 'wheelchair_accessible' };
    }
    if (intent.accessibility_needs.includes('stretcher')) {
      return { name: 'Ambulans', type: 'ambulance' };
    }
    if (intent.accessibility_needs.includes('assistant')) {
      return { name: 'Mobil dengan pendamping', type: 'assisted' };
    }

    // Select based on urgency
    if (intent.urgency === 'high') {
      return { name: 'Mobil prioritas', type: 'priority' };
    }

    return { name: 'Mobil standar', type: 'standard' };
  }

  private estimateETA(intent: GoToPlaceIntent): number {
    // Mock ETA calculation
    if (intent.urgency === 'high') return 5;
    if (intent.urgency === 'medium') return 10;
    return 15;
  }

  private estimatePrice(etaMinutes: number, urgency: 'low' | 'medium' | 'high'): number {
    const baseFare = 12000;
    const perMinute = 1200;
    const urgencyMultiplier = urgency === 'high' ? 1.25 : urgency === 'low' ? 0.9 : 1.0;
    const raw = (baseFare + etaMinutes * perMinute) * urgencyMultiplier;
    return Math.round(raw / 500) * 500;
  }

  private formatCurrency(amount: number): string {
    return `Rp ${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  }

  private getRecommendations(context: string): { id: string; title: string; description: string; eta?: string }[] {
    switch (context) {
      case 'transport':
        return [
          { id: '1', title: 'Mobil Akses Kursi Roda', description: 'Dilengkapi ramp dan pengait kursi roda', eta: '8 menit' },
          { id: '2', title: 'Mobil Standar', description: 'Nyaman untuk perjalanan sehari-hari', eta: '5 menit' },
          { id: '3', title: 'Ambulans Non-Darurat', description: 'Untuk kebutuhan medis', eta: '12 menit' },
        ];
      case 'route':
        return [
          { id: '1', title: 'Rute Tercepat', description: 'Via jalan tol, estimasi 15 menit' },
          { id: '2', title: 'Rute Termurah', description: 'Hindari tol, estimasi 25 menit' },
          { id: '3', title: 'Rute Aksesibel', description: 'Jalan mulus, estimasi 20 menit' },
        ];
      case 'time':
        return [
          { id: '1', title: 'Berangkat Sekarang', description: 'Tiba sekitar 15 menit lagi' },
          { id: '2', title: 'Berangkat 30 menit lagi', description: 'Hindari kemacetan pagi' },
        ];
      default:
        return [];
    }
  }

  private buildRecommendationSpeech(context: string, options: { title: string }[]): string {
    const contextLabels: Record<string, string> = {
      transport: 'transportasi',
      route: 'rute',
      time: 'waktu keberangkatan',
    };

    const label = contextLabels[context] || 'pilihan';
    const optionNames = options
      .slice(0, 3)
      .map((o) => o.title)
      .join(', ');

    return `Berikut rekomendasi ${label}: ${optionNames}. Silakan pilih.`;
  }
}
