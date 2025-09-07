export type ContentType = 'person' | 'news' | 'social' | 'other';
export type CompetitiveStrength = 'high' | 'medium' | 'low';
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type RecommendationType = 'immediate' | 'medium_term' | 'long_term';

export interface CompetitorScore {
  rank: number;
  url: string;
  title: string;
  domain: string;
  domainAuthority: number;
  contentType: ContentType;
  competitiveStrength: CompetitiveStrength;
  isTargetPerson: boolean;
  lastUpdated?: Date;
}

export interface SearchAnalysisRequest {
  name: string;
  location?: string;
  searchCount?: number;
}

export interface AnalysisSummary {
  totalCompetitors: number;
  strongCompetitors: number;
  opportunities: number;
  averageDomainAuthority: number;
}

export interface Recommendation {
  id: string;
  analysisId: string;
  type: RecommendationType;
  description: string;
  priorityScore: number;
}

export interface Opportunity {
  rank: number;
  competitorUrl: string;
  reason: string;
  actionSuggestion: string;
  impactScore: number;
}

export interface AnalysisData {
  analysisId: string;
  searchQuery: string;
  location?: string;
  searchCount: number;
  searchResults: CompetitorScore[];
  analysis: AnalysisSummary;
  recommendations: Recommendation[];
  opportunities: Opportunity[];
  createdAt: Date;
  status: AnalysisStatus;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface SearchAnalysisResponse {
  success: boolean;
  data?: AnalysisData;
  error?: ApiError;
}

export interface SearchResult {
  rank: number;
  url: string;
  title: string;
  snippet?: string;
  displayUrl?: string;
}

export interface DomainMetrics {
  domain: string;
  domainAuthority: number;
  pageAuthority?: number;
  spamScore?: number;
  backlinks?: number;
}

export interface SearchOptions {
  location?: string;
  count?: number;
  language?: string;
}

export interface SearchFormData {
  name: string;
  location?: string;
  searchCount: number;
}

export interface AnalysisHistory {
  id: string;
  searchQuery: string;
  createdAt: string;
  status: AnalysisStatus;
  totalCompetitors: number;
  opportunities: number;
}

export interface SearchHistoryResponse {
  success: boolean;
  data?: {
    analyses: AnalysisHistory[];
    total: number;
    page: number;
    pageSize: number;
  };
  error?: ApiError;
}

export interface AnalysisDetailResponse {
  success: boolean;
  data?: AnalysisData;
  error?: ApiError;
}