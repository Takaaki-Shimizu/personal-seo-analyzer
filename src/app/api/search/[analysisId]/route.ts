import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    const { analysisId } = await params;
    
    const databaseService = new DatabaseService();
    const analysisResult = await databaseService.getAnalysis(analysisId);

    if (!analysisResult.data) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '分析結果が見つかりません' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: analysisResult.data,
    });

  } catch (error) {
    console.error('Analysis fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_SERVER_ERROR', 
          message: '分析結果の取得に失敗しました' 
        } 
      },
      { status: 500 }
    );
  }
}