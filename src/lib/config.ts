export const config = {
  google: {
    apiKey: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || '',
    searchEngineId: process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || '',
    maxResults: 20,
    defaultResults: 10,
  },
  
  domainAuthority: {
    mozAccessId: process.env.MOZ_ACCESS_ID,
    mozSecretKey: process.env.MOZ_SECRET_KEY,
    fallbackEnabled: true,
  },
  
  analysis: {
    cacheExpirationHours: 24,
    maxSearchCount: 20,
    minSearchCount: 10,
    rateLimit: {
      maxRequestsPerDay: 100,
      maxRequestsPerUser: 3,
    },
  },
  
  redis: {
    url: process.env.REDIS_URL,
  },
} as const;

export const validateConfig = () => {
  const required = {
    'GOOGLE_CUSTOM_SEARCH_API_KEY': config.google.apiKey,
    'GOOGLE_CUSTOM_SEARCH_ENGINE_ID': config.google.searchEngineId,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};