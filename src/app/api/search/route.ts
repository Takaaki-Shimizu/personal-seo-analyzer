import { NextRequest, NextResponse } from 'next/server';
import { analysisRequestSchema } from '@/lib/validations';
import { GoogleSearchService } from '@/lib/services/google-search';
import { DomainAuthorityService } from '@/lib/services/domain-authority';
import { AnalysisEngine } from '@/lib/services/analysis-engine';
import { DatabaseService } from '@/lib/services/database';
import { AnalysisData } from '@/types/analysis';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_JSON', 
            message: 'リクエストボディが正しいJSON形式ではありません' 
          } 
        },
        { status: 400 }
      );
    }

    let validatedData;
    try {
      validatedData = analysisRequestSchema.parse(body);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: '入力データが正しくありません',
            details: validationError 
          } 
        },
        { status: 400 }
      );
    }

    const databaseService = new DatabaseService();
    const analysisId = uuidv4();
    
    await databaseService.saveAnalysis({
      analysisId,
      searchQuery: validatedData.name,
      location: validatedData.location,
      searchCount: validatedData.searchCount || 10,
      searchResults: [],
      analysis: { totalCompetitors: 0, strongCompetitors: 0, opportunities: 0, averageDomainAuthority: 0 },
      recommendations: [],
      opportunities: [],
      createdAt: new Date(),
      status: 'processing',
    });

    processAnalysisInBackground(analysisId, validatedData);

    return NextResponse.json({
      success: true,
      data: { analysisId, status: 'processing' },
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_SERVER_ERROR', 
          message: '分析の開始に失敗しました',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    );
  }
}

async function processAnalysisInBackground(analysisId: string, request: { name: string; location?: string; searchCount?: number }) {
  try {
    const googleSearchService = new GoogleSearchService();
    const domainAuthorityService = new DomainAuthorityService();
    const analysisEngine = new AnalysisEngine();
    const databaseService = new DatabaseService();

    const searchResults = await googleSearchService.searchCompetitors(request.name, {
      location: request.location,
      count: request.searchCount || 10,
    });

    const domains = searchResults.map(result => new URL(result.url).hostname);
    const domainMetrics = await domainAuthorityService.batchGetDomainMetrics(domains);

    const competitorScores = analysisEngine.analyzeCompetitiveStrength(
      searchResults,
      domainMetrics,
      request.name
    );

    const opportunities = analysisEngine.identifyOpportunities(competitorScores);
    const recommendations = analysisEngine.generateRecommendations(competitorScores, opportunities);
    
    recommendations.forEach(rec => {
      rec.analysisId = analysisId;
      rec.id = `${analysisId}-${rec.type}-${Date.now()}`;
    });

    const analysisSummary = analysisEngine.calculateAnalysisSummary(competitorScores);

    const finalData: AnalysisData = {
      analysisId,
      searchQuery: request.name,
      location: request.location,
      searchCount: request.searchCount || 10,
      searchResults: competitorScores,
      analysis: analysisSummary,
      recommendations,
      opportunities,
      createdAt: new Date(),
      status: 'completed',
    };

    await databaseService.updateAnalysisStatus(analysisId, 'completed');
    
    const { data: existingAnalysis } = await databaseService.getAnalysis(analysisId);
    if (existingAnalysis) {
      await databaseService.saveAnalysis(finalData);
    }

  } catch (error) {
    console.error('Background analysis error:', error);
    const databaseService = new DatabaseService();
    await databaseService.updateAnalysisStatus(analysisId, 'failed');
  }
}