import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase';
import { AnalysisData, AnalysisHistory, CompetitorScore, Recommendation } from '@/types/analysis';

export class DatabaseService {
  private supabase;

  constructor(useServiceRole: boolean = false) {
    this.supabase = useServiceRole ? createServiceRoleClient() : createServerSupabaseClient();
  }

  async saveAnalysis(data: AnalysisData, userId: string): Promise<string> {
    try {
      const { error: analysisError } = await this.supabase
        .from('search_analyses')
        .insert({
          id: data.analysisId,
          user_id: userId,
          search_query: data.searchQuery,
          location: data.location,
          search_count: data.searchCount,
          status: data.status,
          cache_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          total_competitors: data.analysis.totalCompetitors,
          strong_competitors: data.analysis.strongCompetitors,
          opportunities: data.analysis.opportunities,
          average_domain_authority: data.analysis.averageDomainAuthority,
        })
        .select()
        .single();

      if (analysisError) throw analysisError;

      await this.saveSearchResults(data.searchResults, data.analysisId);
      await this.saveRecommendations(data.recommendations, data.analysisId);

      return data.analysisId;
    } catch (error) {
      console.error('Database save error:', error);
      throw new Error('分析結果の保存に失敗しました');
    }
  }

  private async saveSearchResults(results: CompetitorScore[], analysisId: string): Promise<void> {
    const searchResults = results.map(result => ({
      analysis_id: analysisId,
      rank: result.rank,
      url: result.url,
      title: result.title,
      domain: result.domain,
      domain_authority: result.domainAuthority,
      content_type: result.contentType,
      competitive_strength: result.competitiveStrength,
      is_target_person: result.isTargetPerson,
      last_updated: result.lastUpdated?.toISOString(),
    }));

    const { error } = await this.supabase
      .from('search_results')
      .insert(searchResults);

    if (error) throw error;
  }

  private async saveRecommendations(recommendations: Recommendation[], analysisId: string): Promise<void> {
    const recs = recommendations.map(rec => ({
      id: rec.id,
      analysis_id: analysisId,
      recommendation_type: rec.type,
      description: rec.description,
      priority_score: rec.priorityScore,
    }));

    const { error } = await this.supabase
      .from('analysis_recommendations')
      .insert(recs);

    if (error) throw error;
  }

  async getAnalysis(analysisId: string, userId?: string): Promise<AnalysisData | null> {
    try {
      let query = this.supabase
        .from('search_analyses')
        .select(`
          *,
          search_results (*),
          analysis_recommendations (*)
        `)
        .eq('id', analysisId);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.single();

      if (error || !data) return null;

      return {
        analysisId: data.id,
        searchQuery: data.search_query,
        location: data.location,
        searchCount: data.search_count,
        searchResults: (data.search_results as unknown as CompetitorScore[]),
        analysis: {
          totalCompetitors: data.total_competitors,
          strongCompetitors: data.strong_competitors,
          opportunities: data.opportunities,
          averageDomainAuthority: data.average_domain_authority,
        },
        recommendations: (data.analysis_recommendations as unknown as Recommendation[]),
        opportunities: [],
        createdAt: new Date(data.created_at),
        status: data.status,
      };
    } catch (error) {
      console.error('Database fetch error:', error);
      throw new Error('分析結果の取得に失敗しました');
    }
  }

  async getUserAnalysisHistory(
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ analyses: AnalysisHistory[]; total: number }> {
    try {
      const offset = (page - 1) * pageSize;

      const { data, error, count } = await this.supabase
        .from('search_analyses')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      const analyses: AnalysisHistory[] = (data || []).map(item => ({
        id: item.id,
        searchQuery: item.search_query,
        createdAt: item.created_at,
        status: item.status,
        totalCompetitors: item.total_competitors || 0,
        opportunities: item.opportunities || 0,
      }));

      return {
        analyses,
        total: count || 0,
      };
    } catch (error) {
      console.error('Database history fetch error:', error);
      throw new Error('分析履歴の取得に失敗しました');
    }
  }

  async isCacheValid(query: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('search_analyses')
        .select('cache_expires_at')
        .eq('user_id', userId)
        .eq('search_query', query)
        .eq('status', 'completed')
        .gt('cache_expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  async getCachedAnalysis(query: string, userId: string): Promise<AnalysisData | null> {
    try {
      const { data, error } = await this.supabase
        .from('search_analyses')
        .select(`
          *,
          search_results (*),
          analysis_recommendations (*)
        `)
        .eq('user_id', userId)
        .eq('search_query', query)
        .eq('status', 'completed')
        .gt('cache_expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      return this.mapDatabaseToAnalysisData(data);
    } catch {
      return null;
    }
  }

  private mapDatabaseToAnalysisData(data: Record<string, unknown>): AnalysisData {
    return {
      analysisId: data.id,
      searchQuery: data.search_query,
      location: data.location,
      searchCount: data.search_count,
      searchResults: (data.search_results as unknown as CompetitorScore[]),
      analysis: {
        totalCompetitors: data.total_competitors,
        strongCompetitors: data.strong_competitors,
        opportunities: data.opportunities,
        averageDomainAuthority: data.average_domain_authority,
      },
      recommendations: (data.analysis_recommendations as unknown as Recommendation[]),
      opportunities: [],
      createdAt: new Date(data.created_at),
      status: data.status,
    };
  }

  async updateAnalysisStatus(analysisId: string, status: string): Promise<void> {
    const { error } = await this.supabase
      .from('search_analyses')
      .update({ status })
      .eq('id', analysisId);

    if (error) throw error;
  }

  async deleteAnalysis(analysisId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('search_analyses')
      .delete()
      .eq('id', analysisId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}