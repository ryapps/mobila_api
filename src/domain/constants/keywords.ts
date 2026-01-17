// Domain Constants - Keyword mappings for intent detection

export const KEYWORDS = {
  // Place type keywords
  hospital: ['rumah sakit', 'rs', 'klinik', 'igd', 'puskesmas', 'dokter'],
  office: ['kantor', 'tempat kerja', 'kerja', 'office'],
  school: ['sekolah', 'kampus', 'universitas', 'kuliah', 'belajar'],

  // Urgency keywords
  highUrgency: ['sekarang', 'darurat', 'cepat', 'segera', 'igd', 'emergency', 'urgent'],
  mediumUrgency: ['hari ini', 'sebentar lagi', 'nanti'],

  // Time constraint keywords
  now: ['sekarang', 'langsung', 'segera'],
  scheduled: ['besok', 'nanti', 'jam', 'pukul', 'lusa'],

  // Action keywords
  confirm: ['ya', 'oke', 'ok', 'lanjutkan', 'setuju', 'iya', 'benar', 'betul', 'yup', 'yes', 'lanjut', 'boleh', 'baik'],
  cancel: ['tidak', 'batal', 'cancel', 'tidak jadi', 'gak jadi', 'nggak', 'jangan', 'stop', 'batalkan'],

  // Recommendation keywords
  recommendation: ['rekomendasi', 'saran', 'suggest', 'apa yang', 'mana yang', 'terbaik', 'paling aman', 'paling cepat', 'paling murah'],

  // Context keywords
  transport: ['transportasi', 'kendaraan', 'mobil', 'motor', 'bus', 'kereta', 'ojek', 'taxi', 'taksi', 'angkutan'],
  route: ['rute', 'jalan', 'jalur', 'arah', 'lewat mana'],
  time: ['waktu', 'jam berapa', 'kapan', 'lama', 'durasi'],

  // Accessibility keywords
  wheelchair: ['kursi roda', 'wheelchair'],
  assistant: ['pendamping', 'dampingi', 'temani', 'assistant'],
  stretcher: ['tidak bisa jalan', 'tandu', 'stretcher', 'baring'],

  // Navigation keywords
  goTo: ['ke', 'pergi', 'antar', 'jemput', 'menuju', 'berangkat', 'mau ke', 'ingin ke'],
  question: ['apa', 'mana', 'bagaimana', 'gimana', '?'],
} as const;
