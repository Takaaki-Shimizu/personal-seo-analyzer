export const config = {
  google: {
    apiKey: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY!,
    searchEngineId: process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID!,
    maxResults: 20,
    defaultResults: 10,
  },
  
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
    'NEXT_PUBLIC_SUPABASE_URL': config.supabase.url,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': config.supabase.anonKey,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};