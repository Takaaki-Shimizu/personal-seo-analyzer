import { AnalysisData } from '@/types/analysis';

// メモリベースの簡易データストア
const analysisStore = new Map<string, AnalysisData>();

export class DatabaseService {
  constructor() {
    // 簡易実装では何もしない
  }

  async saveAnalysis(data: AnalysisData): Promise<string> {
    try {
      // メモリストアに保存
      analysisStore.set(data.analysisId, data);
      console.log(`分析データを保存しました: ${data.analysisId}`);
      return data.analysisId;
    } catch (error) {
      console.error('Database save error:', error);
      throw new Error('分析結果の保存に失敗しました');
    }
  }


  async getAnalysis(analysisId: string): Promise<{ data: AnalysisData | null; error?: string }> {
    try {
      const data = analysisStore.get(analysisId);
      return { data: data || null };
    } catch (error) {
      console.error('Database fetch error:', error);
      return { data: null, error: '分析結果の取得に失敗しました' };
    }
  }


  async updateAnalysisStatus(analysisId: string, status: string): Promise<void> {
    const data = analysisStore.get(analysisId);
    if (data) {
      data.status = status as 'processing' | 'completed' | 'failed';
      analysisStore.set(analysisId, data);
      console.log(`分析ステータスを更新しました: ${analysisId} -> ${status}`);
    }
  }
}