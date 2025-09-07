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
  
  // 本番環境での詳細ログ制御
  logging: {
    enableDetailedLogs: process.env.NODE_ENV === 'production',
    logApiErrors: true,
    logFallbackUsage: true,
  },
  
  // 本番環境での動作モード
  environment: {
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    forceApiMockMode: process.env.FORCE_MOCK_MODE === 'true',
  },
} as const;

export const validateConfig = () => {
  // 本番環境での設定検証を柔軟に
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Google APIの設定チェック
  if (!config.google.apiKey && !config.environment.forceApiMockMode) {
    warnings.push('GOOGLE_CUSTOM_SEARCH_API_KEY が設定されていません。モックデータを使用します。');
  }
  
  if (!config.google.searchEngineId && !config.environment.forceApiMockMode) {
    warnings.push('GOOGLE_CUSTOM_SEARCH_ENGINE_ID が設定されていません。モックデータを使用します。');
  }

  // 本番環境でのログ出力
  if (config.logging.enableDetailedLogs) {
    console.log('=== 本番環境設定確認 ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Google API Key 設定:', !!config.google.apiKey);
    console.log('Google Search Engine ID 設定:', !!config.google.searchEngineId);
    console.log('Moz API 設定:', !!config.domainAuthority.mozAccessId);
    console.log('モックモード強制:', config.environment.forceApiMockMode);
    
    if (warnings.length > 0) {
      console.log('警告:');
      warnings.forEach(warning => console.log('  -', warning));
    }
  }
  
  // 致命的エラーのみで停止
  if (errors.length > 0) {
    throw new Error(`致命的な設定エラー: ${errors.join(', ')}`);
  }
  
  return { warnings, errors };
};