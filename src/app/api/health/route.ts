import { NextRequest, NextResponse } from 'next/server';
import { config, validateConfig } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const validationResult = validateConfig();
    
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isProduction: config.environment.isProduction,
        isDevelopment: config.environment.isDevelopment,
        forceApiMockMode: config.environment.forceApiMockMode,
      },
      configuration: {
        googleApi: {
          hasApiKey: !!config.google.apiKey,
          hasSearchEngineId: !!config.google.searchEngineId,
          apiKeyPattern: config.google.apiKey ? 
            config.google.apiKey.substring(0, 10) + '...' : 'not set',
        },
        domainAuthority: {
          hasMozCredentials: !!(config.domainAuthority.mozAccessId && config.domainAuthority.mozSecretKey),
          fallbackEnabled: config.domainAuthority.fallbackEnabled,
        },
        logging: {
          enableDetailedLogs: config.logging.enableDetailedLogs,
          logApiErrors: config.logging.logApiErrors,
          logFallbackUsage: config.logging.logFallbackUsage,
        },
      },
      validation: {
        warnings: validationResult.warnings,
        errors: validationResult.errors,
      },
    };

    return NextResponse.json(healthStatus);
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}