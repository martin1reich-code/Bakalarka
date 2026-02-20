export const VOICE_MODELS = [
  {
    id: 'google-cs-neural2-a',
    name: 'CS-Neural2-A (Ž) - Google',
    provider: 'google',
    language: 'Čeština',
    gender: 'female',
    description: 'Ženský hlas s přirozenou intonací, optimalizovaný pro dlouhé texty',
    rating: 4.8,
    sampleUrl: '/samples/google-neural2-a.mp3',
    features: ['Neural', 'High Quality', 'Emotion'],
    pricing: { characters: 1000000, price: 4 }
  },
  {
    id: 'google-cs-wavenet-a',
    name: 'CS-Wavenet-A (Ž) - Google',
    provider: 'google',
    language: 'Čeština',
    gender: 'female',
    description: 'Wavenet hlas, jeden z nejpřirozenějších dostupných',
    rating: 4.9,
    sampleUrl: '/samples/google-wavenet-a.mp3',
    features: ['Wavenet', 'Premium', 'Natural'],
    pricing: { characters: 1000000, price: 16 }
  },
  {
    id: 'microsoft-cs-antonin',
    name: 'Antonín (M) - Microsoft',
    provider: 'microsoft',
    language: 'Čeština',
    gender: 'male',
    description: 'Mužský hlas s neutrální intonací',
    rating: 4.5,
    sampleUrl: '/samples/microsoft-antonin.mp3',
    features: ['Neural', 'Accent Support'],
    pricing: { characters: 1000000, price: 15 }
  },
  {
    id: 'amazon-cs-standard',
    name: 'Polly Standard (Ž) - Amazon',
    provider: 'amazon',
    language: 'Čeština',
    gender: 'female',
    description: 'Standardní kvalita pro běžné použití',
    rating: 4.2,
    sampleUrl: '/samples/amazon-standard.mp3',
    features: ['Standard', 'Cost-effective'],
    pricing: { characters: 1000000, price: 4 }
  },
  {
    id: 'google-en-neural2-d',
    name: 'EN-Neural2-D (M) - Google',
    provider: 'google',
    language: 'Angličtina (US)',
    gender: 'male',
    description: 'Americký mužský hlas pro profesionální použití',
    rating: 4.7,
    sampleUrl: '/samples/google-en-neural2-d.mp3',
    features: ['Neural', 'Professional'],
    pricing: { characters: 1000000, price: 4 }
  },
  {
    id: 'microsoft-en-guy',
    name: 'Guy (M) - Microsoft',
    provider: 'microsoft',
    language: 'Angličtina (US)',
    gender: 'male',
    description: 'Dynamický mužský hlas s expresí',
    rating: 4.6,
    sampleUrl: '/samples/microsoft-guy.mp3',
    features: ['Neural', 'Expressive'],
    pricing: { characters: 1000000, price: 15 }
  }
]

export const MOCK_USER_STATS = {
  totalGenerations: 127,
  totalDuration: 8640, // v sekundách
  totalCharacters: 45000,
  favoriteModel: 'google-cs-neural2-a',
  recentActivity: [
    { date: '2024-01-15', count: 8 },
    { date: '2024-01-14', count: 5 },
    { date: '2024-01-13', count: 9 },
    { date: '2024-01-12', count: 6 },
    { date: '2024-01-11', count: 7 },
    { date: '2024-01-10', count: 4 },
    { date: '2024-01-09', count: 3 }
  ],
  modelUsage: [
    { modelId: 'google-cs-neural2-a', count: 45 },
    { modelId: 'google-cs-wavenet-a', count: 32 },
    { modelId: 'microsoft-cs-antonin', count: 28 },
    { modelId: 'amazon-cs-standard', count: 15 },
    { modelId: 'google-en-neural2-d', count: 7 }
  ]
}

export async function generateAudio(text: string, options: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ audioUrl: '/mock-audio.mp3', duration: 10 })
    }, 1000)
  })
}

export async function generateSSML(text: string) {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve(`<speak>${text}</speak>`)
    }, 500)
  })
}
