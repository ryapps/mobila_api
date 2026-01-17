// Intent Interpreter Agent for Mobility Application
// Converts natural language to structured JSON intent

interface GoToPlaceIntent {
  intent: 'GO_TO_PLACE';
  place_type: 'hospital' | 'office' | 'school' | 'other';
  place_name: string | null;
  urgency: 'low' | 'medium' | 'high';
  time_constraint: 'now' | 'scheduled';
  accessibility_needs: ('wheelchair' | 'assistant' | 'stretcher')[];
}

interface RequestRecommendationIntent {
  intent: 'REQUEST_RECOMMENDATION';
  context: 'transport' | 'route' | 'time';
}

interface ConfirmActionIntent {
  intent: 'CONFIRM_ACTION';
}

interface CancelActionIntent {
  intent: 'CANCEL_ACTION';
}

type Intent = GoToPlaceIntent | RequestRecommendationIntent | ConfirmActionIntent | CancelActionIntent;

// Keywords mapping
const HOSPITAL_KEYWORDS = ['rumah sakit', 'rs', 'klinik', 'igd', 'puskesmas', 'dokter'];
const OFFICE_KEYWORDS = ['kantor', 'tempat kerja', 'kerja', 'office'];
const SCHOOL_KEYWORDS = ['sekolah', 'kampus', 'universitas', 'kuliah', 'belajar'];
const HIGH_URGENCY_KEYWORDS = ['sekarang', 'darurat', 'cepat', 'segera', 'igd', 'emergency', 'urgent'];
const MEDIUM_URGENCY_KEYWORDS = ['hari ini', 'sebentar lagi', 'nanti'];
const NOW_KEYWORDS = ['sekarang', 'langsung', 'segera'];
const SCHEDULED_KEYWORDS = ['besok', 'nanti', 'jam', 'pukul', 'lusa'];
const CONFIRM_KEYWORDS = ['ya', 'oke', 'ok', 'lanjutkan', 'setuju', 'iya', 'benar', 'betul', 'yup', 'yes', 'lanjut', 'boleh', 'baik'];
const CANCEL_KEYWORDS = ['tidak', 'batal', 'cancel', 'tidak jadi', 'gak jadi', 'nggak', 'jangan', 'stop', 'batalkan'];
const RECOMMENDATION_KEYWORDS = ['rekomendasi', 'saran', 'suggest', 'apa yang', 'mana yang', 'terbaik', 'paling aman', 'paling cepat', 'paling murah'];
const TRANSPORT_KEYWORDS = ['transportasi', 'kendaraan', 'mobil', 'motor', 'bus', 'kereta', 'ojek', 'taxi', 'taksi', 'angkutan'];
const ROUTE_KEYWORDS = ['rute', 'jalan', 'jalur', 'arah', 'lewat mana'];
const TIME_KEYWORDS = ['waktu', 'jam berapa', 'kapan', 'lama', 'durasi'];
const WHEELCHAIR_KEYWORDS = ['kursi roda', 'wheelchair'];
const ASSISTANT_KEYWORDS = ['pendamping', 'dampingi', 'temani', 'assistant'];
const STRETCHER_KEYWORDS = ['tidak bisa jalan', 'tandu', 'stretcher', 'baring'];

function normalizeInput(input: string): string {
  return input.toLowerCase().trim();
}

function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function extractPlaceName(text: string): string | null {
  // Pattern to extract place names after "ke" or specific location indicators
  const patterns = [/ke\s+(?:rumah sakit|rs)\s+(\w+(?:\s+\w+)*)/i, /ke\s+(?:kantor)\s+(\w+(?:\s+\w+)*)/i, /ke\s+(?:sekolah|kampus)\s+(\w+(?:\s+\w+)*)/i, /ke\s+(\w+(?:\s+\w+)*)\s+(?:hospital|mall|plaza)/i];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function detectPlaceType(text: string): 'hospital' | 'office' | 'school' | 'other' {
  if (containsAny(text, HOSPITAL_KEYWORDS)) return 'hospital';
  if (containsAny(text, OFFICE_KEYWORDS)) return 'office';
  if (containsAny(text, SCHOOL_KEYWORDS)) return 'school';
  return 'other';
}

function detectUrgency(text: string): 'low' | 'medium' | 'high' {
  if (containsAny(text, HIGH_URGENCY_KEYWORDS)) return 'high';
  if (containsAny(text, MEDIUM_URGENCY_KEYWORDS)) return 'medium';
  // Default to medium if no urgency indicators
  return 'medium';
}

function detectTimeConstraint(text: string): 'now' | 'scheduled' {
  if (containsAny(text, SCHEDULED_KEYWORDS)) return 'scheduled';
  if (containsAny(text, NOW_KEYWORDS)) return 'now';
  // Default to now
  return 'now';
}

function detectAccessibilityNeeds(text: string): ('wheelchair' | 'assistant' | 'stretcher')[] {
  const needs: ('wheelchair' | 'assistant' | 'stretcher')[] = [];

  if (containsAny(text, WHEELCHAIR_KEYWORDS)) needs.push('wheelchair');
  if (containsAny(text, ASSISTANT_KEYWORDS)) needs.push('assistant');
  if (containsAny(text, STRETCHER_KEYWORDS)) needs.push('stretcher');

  return needs;
}

function detectRecommendationContext(text: string): 'transport' | 'route' | 'time' {
  if (containsAny(text, TRANSPORT_KEYWORDS)) return 'transport';
  if (containsAny(text, ROUTE_KEYWORDS)) return 'route';
  if (containsAny(text, TIME_KEYWORDS)) return 'time';
  // Default to transport
  return 'transport';
}

function isGoToPlaceIntent(text: string): boolean {
  const goKeywords = ['ke', 'pergi', 'antar', 'jemput', 'menuju', 'berangkat', 'mau ke', 'ingin ke'];
  const hasPlaceIndicator = containsAny(text, [...HOSPITAL_KEYWORDS, ...OFFICE_KEYWORDS, ...SCHOOL_KEYWORDS]);
  const hasGoKeyword = containsAny(text, goKeywords);

  return hasGoKeyword || hasPlaceIndicator;
}

function isRecommendationIntent(text: string): boolean {
  const questionIndicators = ['apa', 'mana', 'bagaimana', 'gimana', '?'];
  return containsAny(text, RECOMMENDATION_KEYWORDS) || (containsAny(text, questionIndicators) && containsAny(text, [...TRANSPORT_KEYWORDS, ...ROUTE_KEYWORDS, ...TIME_KEYWORDS]));
}

function isConfirmIntent(text: string): boolean {
  const normalized = text.replace(/[^a-zA-Z\s]/g, '').trim();
  // Check if the text is primarily a confirmation
  return CONFIRM_KEYWORDS.some((keyword) => {
    const pattern = new RegExp(`^${keyword}$|^${keyword}\\s|\\s${keyword}$`, 'i');
    return pattern.test(normalized) || normalized === keyword;
  });
}

function isCancelIntent(text: string): boolean {
  return containsAny(text, CANCEL_KEYWORDS);
}

export function parseIntent(userInput: string): Intent {
  const text = normalizeInput(userInput);

  // Priority order: Cancel > Confirm > Recommendation > GoToPlace

  // Check for cancel intent first (safety priority)
  if (isCancelIntent(text)) {
    return { intent: 'CANCEL_ACTION' };
  }

  // Check for explicit confirmation
  if (isConfirmIntent(text) && !isGoToPlaceIntent(text) && !isRecommendationIntent(text)) {
    return { intent: 'CONFIRM_ACTION' };
  }

  // Check for recommendation request
  if (isRecommendationIntent(text)) {
    return {
      intent: 'REQUEST_RECOMMENDATION',
      context: detectRecommendationContext(text),
    };
  }

  // Check for go to place intent
  if (isGoToPlaceIntent(text)) {
    const placeType = detectPlaceType(text);
    const urgency = detectUrgency(text);

    // IGD or emergency keywords should boost urgency to high
    const finalUrgency = containsAny(text, ['igd', 'darurat', 'emergency']) ? 'high' : urgency;

    return {
      intent: 'GO_TO_PLACE',
      place_type: placeType,
      place_name: extractPlaceName(text),
      urgency: finalUrgency,
      time_constraint: detectTimeConstraint(text),
      accessibility_needs: detectAccessibilityNeeds(text),
    };
  }

  // Default: If unclear, return safest intent (GO_TO_PLACE with conservative defaults)
  return {
    intent: 'GO_TO_PLACE',
    place_type: 'other',
    place_name: null,
    urgency: 'medium',
    time_constraint: 'now',
    accessibility_needs: [],
  };
}

// Main function to process input and output JSON only
export function processUserInput(userInput: string): string {
  const intent = parseIntent(userInput);
  return JSON.stringify(intent);
}

// ============================================
// HTTP API Server
// ============================================

const PORT = process.env.PORT || 3000;

async function parseRequestBody(req: import('http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sendJsonResponse(res: import('http').ServerResponse, statusCode: number, data: object): void {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

async function handleRequest(req: import('http').IncomingMessage, res: import('http').ServerResponse): Promise<void> {
  const url = req.url || '/';
  const method = req.method || 'GET';

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // Health check endpoint
  if (url === '/health' && method === 'GET') {
    sendJsonResponse(res, 200, { status: 'ok', service: 'intent-interpreter' });
    return;
  }

  // Main intent parsing endpoint
  if (url === '/parse' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const parsed = JSON.parse(body);

      if (!parsed.text || typeof parsed.text !== 'string') {
        sendJsonResponse(res, 400, { error: 'Missing or invalid "text" field' });
        return;
      }

      const intent = parseIntent(parsed.text);
      sendJsonResponse(res, 200, intent);
    } catch (error) {
      sendJsonResponse(res, 400, { error: 'Invalid JSON body' });
    }
    return;
  }

  // 404 for unknown routes
  sendJsonResponse(res, 404, { error: 'Not found' });
}

// Start server
if (typeof process !== 'undefined' && process.argv) {
  const args = process.argv.slice(2);

  // CLI mode: if arguments provided, process and exit
  if (args.length > 0 && args[0] !== '--server') {
    const userInput = args.join(' ');
    console.log(processUserInput(userInput));
  } else {
    // Server mode
    import('http').then((http) => {
      const server = http.createServer(handleRequest);
      server.listen(PORT, () => {
        console.log(`Intent Interpreter API running on port ${PORT}`);
        console.log(`Endpoints:`);
        console.log(`  POST /parse   - Parse intent from text`);
        console.log(`  GET  /health  - Health check`);
      });
    });
  }
}

// Export for module usage
export default parseIntent;
