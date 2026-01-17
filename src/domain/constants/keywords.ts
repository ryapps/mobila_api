export const KEYWORDS = {
  /* =======================
   * PLACE TYPE
   * ======================= */
  hospital: [
    'rumah sakit', 'rs', 'rsu', 'rsud', 'rsia',
    'klinik', 'klinik umum', 'klinik spesialis',
    'igd', 'unit gawat darurat', 'emergency room', 'er',
    'puskesmas', 'faskes', 'dokter', 'dokter umum',
    'dokter spesialis', 'poliklinik', 'rawat inap',
    'rawat jalan', 'bpjs'
  ],

  office: [
    'kantor', 'tempat kerja', 'kerja', 'office',
    'perusahaan', 'pabrik', 'cabang', 'head office',
    'kantor pusat', 'kantor cabang'
  ],

  school: [
    'sekolah', 'sd', 'smp', 'sma', 'smk',
    'kampus', 'universitas', 'univ', 'institut',
    'politeknik', 'kuliah', 'belajar'
  ],

  home: [
    'rumah', 'pulang', 'ke rumah', 'balik rumah',
    'tempat tinggal', 'kost', 'kos', 'kontrakan'
  ],

  publicPlace: [
    'mall', 'mal', 'plaza', 'pasar', 'minimarket',
    'supermarket', 'bandara', 'airport', 'stasiun',
    'terminal', 'halte', 'pelabuhan'
  ],

  /* =======================
   * URGENCY
   * ======================= */
  highUrgency: [
    'sekarang', 'darurat', 'gawat', 'kritis',
    'cepat', 'segera', 'urgent', 'emergency',
    'butuh cepat', 'butuh sekarang', 'panik'
  ],

  mediumUrgency: [
    'hari ini', 'sebentar lagi', 'nanti',
    'agak cepat', 'jangan lama'
  ],

  lowUrgency: [
    'santai', 'pelan pelan', 'tidak buru-buru',
    'kapan saja', 'bebas'
  ],

  /* =======================
   * TIME CONSTRAINT
   * ======================= */
  now: [
    'sekarang', 'langsung', 'segera',
    'saat ini', 'detik ini'
  ],

  scheduled: [
    'besok', 'lusa', 'minggu depan',
    'nanti', 'jam', 'pukul', 'tanggal',
    'pagi', 'siang', 'sore', 'malam'
  ],

  /* =======================
   * ACTION CONFIRMATION
   * ======================= */
  confirm: [
    'ya', 'iya', 'iyah', 'oke', 'ok',
    'lanjutkan', 'setuju', 'benar', 'betul',
    'yup', 'yes', 'lanjut', 'boleh', 'baik',
    'gas', 'silakan', 'jalankan'
  ],

  cancel: [
    'tidak', 'nggak', 'gak', 'batal', 'batalkan',
    'cancel', 'tidak jadi', 'gak jadi',
    'jangan', 'stop', 'udah gak', 'ga usah'
  ],

  /* =======================
   * RECOMMENDATION
   * ======================= */
  recommendation: [
    'rekomendasi', 'saran', 'sarankan',
    'suggest', 'usulan', 'pilihan',
    'apa yang', 'mana yang', 'yang mana',
    'terbaik', 'paling aman', 'paling cepat',
    'paling nyaman', 'paling murah'
  ],

  /* =======================
   * CONTEXT
   * ======================= */
  transport: [
    'transportasi', 'kendaraan', 'mobil', 'motor',
    'bus', 'kereta', 'ojek', 'taxi', 'taksi',
    'angkutan', 'ambulans', 'ride', 'car'
  ],

  route: [
    'rute', 'jalan', 'jalur', 'arah',
    'lewat mana', 'melalui', 'akses'
  ],

  time: [
    'waktu', 'jam berapa', 'kapan',
    'berapa lama', 'durasi', 'estimasi',
    'eta'
  ],

  cost: [
    'harga', 'biaya', 'tarif', 'ongkos',
    'berapa', 'mahal', 'murah'
  ],

  /* =======================
   * ACCESSIBILITY
   * ======================= */
  wheelchair: [
    'kursi roda', 'wheelchair', 'pakai kursi roda'
  ],

  assistant: [
    'pendamping', 'dampingi', 'temani',
    'assistant', 'butuh bantuan'
  ],

  stretcher: [
    'tidak bisa jalan', 'tidak bisa berdiri',
    'tandu', 'stretcher', 'baring',
    'terlentang'
  ],

  blind: [
    'tunanetra', 'buta', 'tidak bisa lihat'
  ],

  deaf: [
    'tunarungu', 'tuli', 'tidak bisa dengar'
  ],

  /* =======================
   * NAVIGATION / INTENT
   * ======================= */
  goTo: [
    'ke', 'pergi', 'antar', 'jemput',
    'menuju', 'berangkat', 'mau ke',
    'ingin ke', 'pengen ke', 'arah ke'
  ],

  returnHome: [
    'pulang', 'balik', 'kembali'
  ],

  question: [
    'apa', 'mana', 'bagaimana',
    'gimana', 'kenapa', '?'
  ]
} as const;
