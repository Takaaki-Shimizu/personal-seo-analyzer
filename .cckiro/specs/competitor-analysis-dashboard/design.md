# 同名競合分析ダッシュボード - 技術設計書

## 1. システムアーキテクチャ

### 1.1 全体アーキテクチャ
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Server Side   │    │  External APIs  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Dashboard   │ │────│ │ API Routes  │ │────│ │Google Custom│ │
│ │ Components  │ │    │ │ /api/search │ │    │ │Search API   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Form        │ │    │ │ Analysis    │ │    │ │ Domain      │ │
│ │ Components  │ │    │ │ Services    │ │    │ │ Authority   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ │ API         │ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ └─────────────┘ │
│ │ Chart       │ │    │ │ Database    │ │    │                 │
│ │ Components  │ │    │ │ (Supabase)  │ │    │                 │
│ └─────────────┘ │    │ └─────────────┘ │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1.2 技術スタック
- **フロントエンド**: Next.js 15 (App Router), React 19, TypeScript
- **スタイリング**: Tailwind CSS, Radix UI
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase PostgreSQL
- **外部API**: Google Custom Search API, Domain Authority API
- **状態管理**: SWR for data fetching
- **フォーム管理**: React Hook Form

## 2. データベース設計

### 2.1 テーブル構造

#### 2.1.1 search_analyses テーブル
```sql
CREATE TABLE search_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  search_query VARCHAR(255) NOT NULL,
  location VARCHAR(100),
  search_count INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  cache_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- 分析結果サマリー
  total_competitors INTEGER,
  strong_competitors INTEGER,
  opportunities INTEGER,
  average_domain_authority DECIMAL(5,2)
);
```

#### 2.1.2 search_results テーブル
```sql
CREATE TABLE search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES search_analyses(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  domain VARCHAR(255),
  domain_authority DECIMAL(5,2),
  content_type VARCHAR(50), -- person, news, social, other
  competitive_strength VARCHAR(50), -- high, medium, low
  is_target_person BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2.1.3 analysis_recommendations テーブル
```sql
CREATE TABLE analysis_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES search_analyses(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(50), -- immediate, medium_term, long_term
  description TEXT NOT NULL,
  priority_score INTEGER, -- 1-10
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 インデックス設計
```sql
-- パフォーマンス最適化のためのインデックス
CREATE INDEX idx_search_analyses_user_id ON search_analyses(user_id);
CREATE INDEX idx_search_analyses_created_at ON search_analyses(created_at);
CREATE INDEX idx_search_results_analysis_id ON search_results(analysis_id);
CREATE INDEX idx_search_results_rank ON search_results(rank);
CREATE INDEX idx_recommendations_analysis_id ON analysis_recommendations(analysis_id);
```

## 3. API設計

### 3.1 RESTful API エンドポイント

#### 3.1.1 POST /api/search
**リクエスト仕様:**
```typescript
interface SearchAnalysisRequest {
  name: string;              // 必須: 分析対象名
  location?: string;         // オプション: 地域指定
  searchCount?: number;      // オプション: 取得件数 (10-20, default: 10)
}
```

**レスポンス仕様:**
```typescript
interface SearchAnalysisResponse {
  success: boolean;
  data?: {
    analysisId: string;
    searchResults: CompetitorScore[];
    analysis: {
      totalCompetitors: number;
      strongCompetitors: number;
      opportunities: number;
      averageDomainAuthority: number;
    };
    recommendations: Recommendation[];
  };
  error?: {
    code: string;
    message: string;
  };
}
```

#### 3.1.2 GET /api/search/[analysisId]
```typescript
interface AnalysisDetailResponse {
  success: boolean;
  data?: SearchAnalysisResponse['data'];
  error?: SearchAnalysisResponse['error'];
}
```

#### 3.1.3 GET /api/search/history
```typescript
interface SearchHistoryResponse {
  success: boolean;
  data?: {
    analyses: {
      id: string;
      searchQuery: string;
      createdAt: string;
      status: string;
      totalCompetitors: number;
      opportunities: number;
    }[];
    total: number;
    page: number;
    pageSize: number;
  };
}
```

### 3.2 エラーハンドリング設計
```typescript
enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

interface ApiError {
  code: ErrorCodes;
  message: string;
  details?: any;
}
```

## 4. フロントエンド設計

### 4.1 コンポーネント構造
```
src/components/analysis/
├── SearchForm.tsx              # 検索フォーム
├── AnalysisResults.tsx         # 分析結果メインコンテナ
├── ResultsSummary.tsx          # 結果サマリー
├── CompetitorTable.tsx         # 詳細分析表
├── OpportunityRadar.tsx        # 勝機レーダーチャート
├── RecommendationsList.tsx     # アクション提案リスト
└── ExportButton.tsx            # CSVエクスポート機能
```

### 4.2 ページ構造
```
src/app/
├── competitor-analysis/
│   ├── page.tsx                # メインダッシュボードページ
│   ├── loading.tsx             # ローディングUI
│   └── [analysisId]/
│       └── page.tsx            # 個別分析結果ページ
└── api/
    └── search/
        ├── route.ts            # POST /api/search
        ├── [analysisId]/
        │   └── route.ts        # GET /api/search/[analysisId]
        └── history/
            └── route.ts        # GET /api/search/history
```

### 4.3 状態管理設計
```typescript
// SWRを使用したデータフェッチング
const { data, error, isLoading } = useSWR(
  `/api/search/${analysisId}`,
  fetcher,
  {
    refreshInterval: 5000, // 分析中は5秒ごとにポーリング
    revalidateOnFocus: false
  }
);

// フォーム状態管理
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
  watch,
  setValue
} = useForm<SearchFormData>({
  resolver: zodResolver(searchFormSchema)
});
```

## 5. サービス層設計

### 5.1 分析サービス (AnalysisService)
```typescript
class AnalysisService {
  // Google検索結果取得
  async searchGoogle(query: string, options: SearchOptions): Promise<SearchResult[]>
  
  // ドメインオーソリティ取得
  async getDomainAuthority(domains: string[]): Promise<DomainAuthorityMap>
  
  // 競合強度分析
  analyzeCompetitiveStrength(results: SearchResult[]): CompetitorScore[]
  
  // 勝機領域特定
  identifyOpportunities(competitors: CompetitorScore[]): Opportunity[]
  
  // 推奨アクション生成
  generateRecommendations(analysis: AnalysisData): Recommendation[]
}
```

### 5.2 データアクセス層 (DatabaseService)
```typescript
class DatabaseService {
  // 分析データ保存
  async saveAnalysis(data: AnalysisData): Promise<string>
  
  // 分析結果取得
  async getAnalysis(analysisId: string): Promise<AnalysisData | null>
  
  // ユーザーの分析履歴取得
  async getUserAnalysisHistory(userId: string, options: PaginationOptions): Promise<AnalysisHistory[]>
  
  // キャッシュ管理
  async isCacheValid(query: string, userId: string): Promise<boolean>
  async getCachedAnalysis(query: string, userId: string): Promise<AnalysisData | null>
}
```

### 5.3 外部APIサービス (ExternalApiService)
```typescript
class GoogleSearchService {
  async search(query: string, options: GoogleSearchOptions): Promise<GoogleSearchResult[]>
  
  // レート制限管理
  private async checkRateLimit(): Promise<boolean>
  private async handleRateLimitExceeded(): Promise<void>
}

class DomainAuthorityService {
  async getDomainMetrics(domains: string[]): Promise<DomainMetrics[]>
  
  // フォールバック実装（複数のAPI対応）
  private async getMozMetrics(domains: string[]): Promise<DomainMetrics[]>
  private async getAhrefsMetrics(domains: string[]): Promise<DomainMetrics[]>
}
```

## 6. セキュリティ設計

### 6.1 認証・認可
```typescript
// Supabase認証との統合
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

// API Route での認証チェック
const supabase = createRouteHandlerClient({ cookies })
const { data: { user }, error } = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 6.2 入力値検証
```typescript
import { z } from 'zod'

const searchFormSchema = z.object({
  name: z.string()
    .min(1, '名前を入力してください')
    .max(100, '名前は100文字以内で入力してください')
    .regex(/^[a-zA-Z\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\s]+$/, '有効な名前を入力してください'),
  location: z.string().optional(),
  searchCount: z.number().min(10).max(20).default(10)
});
```

### 6.3 レート制限
```typescript
// Redis/Memory-based rate limiting
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '24 h'), // 24時間で3回
  analytics: true,
})
```

## 7. パフォーマンス設計

### 7.1 キャッシュ戦略
```typescript
// 分析結果のキャッシュ (24時間)
const cacheKey = `analysis:${userId}:${hashQuery(query)}`;
await redis.setex(cacheKey, 24 * 3600, JSON.stringify(analysisResult));

// Next.js のISR対応
export const revalidate = 86400; // 24 hours
```

### 7.2 非同期処理設計
```typescript
// バックグラウンドジョブでの分析実行
import { Queue } from 'bullmq';

const analysisQueue = new Queue('analysis-queue');

// 分析ジョブをキューに追加
await analysisQueue.add('analyze-competitor', {
  analysisId,
  query,
  options
});
```

### 7.3 プログレス管理
```typescript
// WebSocket または Server-Sent Events でプログレス通知
interface AnalysisProgress {
  analysisId: string;
  progress: number; // 0-100
  stage: 'searching' | 'analyzing' | 'calculating' | 'completed';
  message: string;
}
```

## 8. 監視・ログ設計

### 8.1 ログ出力
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'analysis.log' })
  ]
});

// 分析開始ログ
logger.info('Analysis started', {
  analysisId,
  userId,
  query,
  timestamp: new Date().toISOString()
});
```

### 8.2 エラートラッキング
```typescript
// Sentry統合（将来実装）
import * as Sentry from '@sentry/nextjs';

try {
  // 分析処理
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'competitor-analysis'
    },
    extra: {
      analysisId,
      query
    }
  });
}
```

## 9. テスト設計

### 9.1 単体テスト
```typescript
// Jest + Testing Library
describe('AnalysisService', () => {
  test('should analyze competitive strength correctly', async () => {
    const mockResults = createMockSearchResults();
    const analysis = new AnalysisService();
    const competitors = analysis.analyzeCompetitiveStrength(mockResults);
    
    expect(competitors).toHaveLength(10);
    expect(competitors[0].competitiveStrength).toBe('high');
  });
});
```

### 9.2 統合テスト
```typescript
// API Route のテスト
describe('/api/search', () => {
  test('should return analysis results', async () => {
    const response = await POST('/api/search', {
      body: JSON.stringify({
        name: 'テスト太郎',
        searchCount: 10
      })
    });
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });
});
```

## 10. デプロイメント設計

### 10.1 環境変数設計
```typescript
// .env.local
GOOGLE_CUSTOM_SEARCH_API_KEY=your_api_key
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_engine_id
MOZ_ACCESS_ID=your_moz_id
MOZ_SECRET_KEY=your_moz_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REDIS_URL=your_redis_url
```

### 10.2 本番環境への配慮
- Vercel でのデプロイメント対応
- Edge Runtime での最適化
- 適切なリソース制限設定
- CDN キャッシュ戦略