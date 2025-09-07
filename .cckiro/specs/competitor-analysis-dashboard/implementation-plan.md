# 同名競合分析ダッシュボード - 実装計画書

## 1. 実装概要

### 1.1 開発アプローチ
- **段階的実装**: MVP機能から段階的に機能を追加
- **アジャイル開発**: 小さな単位でのイテレーション
- **テスト駆動開発**: 主要機能にはテストを先行実装

### 1.2 実装順序
1. **Phase 1**: 基盤構築とデータ構造
2. **Phase 2**: バックエンドAPI実装
3. **Phase 3**: フロントエンド基本機能
4. **Phase 4**: UI/UX改善と高度機能
5. **Phase 5**: テスト・最適化・デプロイ

### 1.3 前提条件
- Git ブランチ管理による開発
- TypeScript strict mode での型安全性確保
- ESLint/Prettier による品質管理

## 2. Phase 1: 基盤構築とデータ構造

### 2.1 型定義の作成
**実装対象**: `src/types/analysis.ts`

**実装内容**:
```typescript
// 競合分析関連の型定義
export interface CompetitorScore {
  rank: number;
  url: string;
  title: string;
  domain: string;
  domainAuthority: number;
  contentType: 'person' | 'news' | 'social' | 'other';
  competitiveStrength: 'high' | 'medium' | 'low';
  isTargetPerson: boolean;
  lastUpdated?: Date;
}

export interface SearchAnalysisRequest {
  name: string;
  location?: string;
  searchCount?: number;
}

export interface SearchAnalysisResponse {
  success: boolean;
  data?: AnalysisData;
  error?: ApiError;
}

export interface AnalysisData {
  analysisId: string;
  searchResults: CompetitorScore[];
  analysis: AnalysisSummary;
  recommendations: Recommendation[];
}

// その他の関連型定義...
```

### 2.2 データベースマイグレーション
**実装対象**: Supabase上でのテーブル作成

**実装手順**:
1. Supabaseプロジェクトでのスキーマ作成
2. `search_analyses`, `search_results`, `analysis_recommendations` テーブル作成
3. 適切なインデックスとRLSポリシーの設定
4. テストデータの投入

### 2.3 環境設定とAPIキー管理
**実装対象**: `.env.local`, `src/lib/config.ts`

**実装内容**:
```typescript
// src/lib/config.ts
export const config = {
  google: {
    apiKey: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY!,
    searchEngineId: process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID!,
  },
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  // その他API設定
};
```

**タスク**:
- [ ] 型定義ファイル作成
- [ ] Supabaseテーブル作成
- [ ] 環境変数設定
- [ ] 設定ファイル作成

**想定工数**: 4時間

## 3. Phase 2: バックエンドAPI実装

### 3.1 外部APIサービス層の実装
**実装対象**: `src/lib/services/`

#### 3.1.1 GoogleSearchService
**ファイル**: `src/lib/services/google-search.ts`

**実装内容**:
```typescript
export class GoogleSearchService {
  private async makeRequest(query: string, options: SearchOptions) {
    // Google Custom Search API呼び出し
    // レート制限処理
    // エラーハンドリング
  }
  
  async searchCompetitors(name: string, options: SearchOptions): Promise<SearchResult[]> {
    // 検索クエリの構築
    // API呼び出し実行
    // 結果の正規化
  }
}
```

#### 3.1.2 DomainAuthorityService  
**ファイル**: `src/lib/services/domain-authority.ts`

**実装内容**:
```typescript
export class DomainAuthorityService {
  // Moz API または代替APIでのドメイン権威スコア取得
  async getDomainMetrics(domains: string[]): Promise<DomainMetrics[]>
  
  // フォールバック機能付きメトリクス取得
  private async getMozMetrics(domains: string[]): Promise<DomainMetrics[]>
  private async getFallbackMetrics(domains: string[]): Promise<DomainMetrics[]>
}
```

### 3.2 分析エンジンの実装
**実装対象**: `src/lib/services/analysis-engine.ts`

**実装内容**:
```typescript
export class AnalysisEngine {
  // コンテンツタイプの判定
  classifyContentType(result: SearchResult): ContentType {
    // URLパターン分析
    // タイトル・説明文分析
    // ドメイン分析
  }
  
  // 競合強度の算出
  calculateCompetitiveStrength(result: SearchResult, domainMetrics: DomainMetrics): CompetitiveStrength {
    // ドメインオーソリティベースの判定
    // コンテンツタイプ考慮
    // 更新頻度考慮
  }
  
  // 機会領域の特定
  identifyOpportunities(competitors: CompetitorScore[]): Opportunity[] {
    // 競合ギャップ分析
    // ポジション別分析
    // アクション提案生成
  }
}
```

### 3.3 APIルートの実装
**実装対象**: `src/app/api/search/route.ts`

**実装内容**:
```typescript
// POST /api/search
export async function POST(request: NextRequest) {
  try {
    // リクエスト検証
    const body = await request.json();
    const validatedData = searchFormSchema.parse(body);
    
    // 認証確認
    const user = await getCurrentUser(request);
    
    // レート制限チェック
    await checkRateLimit(user.id);
    
    // 分析実行（非同期処理）
    const analysisId = await startAnalysis(validatedData, user.id);
    
    return NextResponse.json({
      success: true,
      data: { analysisId }
    });
    
  } catch (error) {
    return handleApiError(error);
  }
}
```

**タスク**:
- [ ] GoogleSearchService実装
- [ ] DomainAuthorityService実装  
- [ ] AnalysisEngine実装
- [ ] APIルート実装
- [ ] エラーハンドリング実装
- [ ] レート制限実装

**想定工数**: 12時間

## 4. Phase 3: フロントエンド基本機能

### 4.1 検索フォームコンポーネント
**実装対象**: `src/components/analysis/SearchForm.tsx`

**実装内容**:
```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface SearchFormProps {
  onSubmit: (data: SearchFormData) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 名前入力フィールド */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          分析対象の名前
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="田中太郎"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* 地域選択（オプション） */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          地域指定（オプション）
        </label>
        <select {...register('location')} className="mt-1 block w-full rounded-md border-gray-300">
          <option value="">指定なし</option>
          <option value="japan">日本</option>
          <option value="tokyo">東京都</option>
          {/* その他の地域オプション */}
        </select>
      </div>

      {/* 取得件数スライダー */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          取得件数: {watch('searchCount')} 件
        </label>
        <input
          {...register('searchCount', { valueAsNumber: true })}
          type="range"
          min="10"
          max="20"
          className="w-full"
        />
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? '分析中...' : '分析開始'}
      </button>
    </form>
  );
}
```

### 4.2 分析結果表示コンポーネント
**実装対象**: `src/components/analysis/AnalysisResults.tsx`

**実装内容**:
```tsx
'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import ResultsSummary from './ResultsSummary';
import CompetitorTable from './CompetitorTable';
import OpportunityRadar from './OpportunityRadar';
import RecommendationsList from './RecommendationsList';

interface AnalysisResultsProps {
  analysisId: string;
}

export default function AnalysisResults({ analysisId }: AnalysisResultsProps) {
  const { data, error, isLoading } = useSWR(
    `/api/search/${analysisId}`,
    fetcher,
    {
      refreshInterval: 5000, // 分析中は5秒ごとにポーリング
      revalidateOnFocus: false,
    }
  );

  if (isLoading) return <AnalysisLoading />;
  if (error) return <ErrorDisplay error={error} />;
  if (!data?.success) return <ErrorDisplay error={data?.error} />;

  const { searchResults, analysis, recommendations } = data.data;

  return (
    <div className="space-y-8">
      {/* 結果サマリー */}
      <ResultsSummary analysis={analysis} />
      
      {/* 勝機レーダーチャート */}
      <OpportunityRadar competitors={searchResults} />
      
      {/* 詳細分析表 */}
      <CompetitorTable competitors={searchResults} />
      
      {/* アクション提案 */}
      <RecommendationsList recommendations={recommendations} />
      
      {/* エクスポートボタン */}
      <div className="flex justify-end">
        <ExportButton data={data.data} />
      </div>
    </div>
  );
}
```

### 4.3 メインページの実装
**実装対象**: `src/app/competitor-analysis/page.tsx`

**実装内容**:
```tsx
'use client';

import { useState } from 'react';
import SearchForm from '@/components/analysis/SearchForm';
import AnalysisResults from '@/components/analysis/AnalysisResults';

export default function CompetitorAnalysisPage() {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSearchSubmit = async (data: SearchFormData) => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAnalysisId(result.data.analysisId);
      } else {
        // エラーハンドリング
        console.error(result.error);
      }
    } catch (error) {
      console.error('分析の開始に失敗しました:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          同名競合分析ダッシュボード
        </h1>
        
        {/* 検索フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <SearchForm onSubmit={handleSearchSubmit} isLoading={isAnalyzing} />
        </div>
        
        {/* 分析結果 */}
        {analysisId && (
          <AnalysisResults analysisId={analysisId} />
        )}
      </div>
    </div>
  );
}
```

**タスク**:
- [ ] SearchFormコンポーネント実装
- [ ] AnalysisResultsコンポーネント実装
- [ ] メインページ実装
- [ ] ローディング・エラー状態の実装
- [ ] レスポンシブデザイン対応

**想定工数**: 10時間

## 5. Phase 4: UI/UX改善と高度機能

### 5.1 結果可視化コンポーネント

#### 5.1.1 競合分析表
**実装対象**: `src/components/analysis/CompetitorTable.tsx`

**実装内容**:
- ソート機能付きテーブル
- 競合強度による色分け表示
- フィルタリング機能
- ページネーション

#### 5.1.2 勝機レーダーチャート
**実装対象**: `src/components/analysis/OpportunityRadar.tsx`

**実装内容**:
- Chart.js or Recharts を使用
- インタラクティブなチャート
- 機会領域のハイライト表示

### 5.2 高度な機能実装

#### 5.2.1 CSVエクスポート機能
**実装対象**: `src/components/analysis/ExportButton.tsx`

**実装内容**:
```tsx
export default function ExportButton({ data }: { data: AnalysisData }) {
  const handleExport = () => {
    const csvData = convertToCSV(data);
    downloadCSV(csvData, `analysis-${data.analysisId}.csv`);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
    >
      CSV出力
    </button>
  );
}
```

#### 5.2.2 分析履歴機能
**実装対象**: `src/components/analysis/AnalysisHistory.tsx`

**実装内容**:
- ユーザーの過去の分析結果一覧
- 再実行機能
- 結果の比較機能

### 5.3 アクセシビリティとパフォーマンス改善

**実装項目**:
- WAI-ARIA属性の追加
- キーボードナビゲーション対応
- 画像最適化
- コードスプリッティング
- SEO対応のメタタグ設定

**タスク**:
- [ ] CompetitorTableコンポーネント実装
- [ ] OpportunityRadarコンポーネント実装
- [ ] CSVエクスポート機能実装
- [ ] 分析履歴機能実装
- [ ] アクセシビリティ改善
- [ ] パフォーマンス最適化

**想定工数**: 14時間

## 6. Phase 5: テスト・最適化・デプロイ

### 6.1 テスト実装

#### 6.1.1 単体テスト
**対象**: サービス層とユーティリティ関数

**実装内容**:
```typescript
// src/__tests__/services/analysis-engine.test.ts
describe('AnalysisEngine', () => {
  describe('classifyContentType', () => {
    test('should classify LinkedIn profile as person', () => {
      const result = {
        url: 'https://linkedin.com/in/john-doe',
        title: 'John Doe - Software Engineer',
      };
      
      const engine = new AnalysisEngine();
      const contentType = engine.classifyContentType(result);
      
      expect(contentType).toBe('person');
    });
  });
});
```

#### 6.1.2 統合テスト
**対象**: APIルートとデータベース連携

**実装内容**:
```typescript
// src/__tests__/api/search.test.ts
describe('/api/search', () => {
  test('should start analysis successfully', async () => {
    const response = await POST('/api/search', {
      body: JSON.stringify({
        name: 'テスト太郎',
        searchCount: 10,
      }),
    });
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.analysisId).toBeDefined();
  });
});
```

#### 6.1.3 E2Eテスト
**対象**: ユーザーシナリオ全体

**実装内容**:
```typescript
// tests/e2e/competitor-analysis.spec.ts
test('complete analysis workflow', async ({ page }) => {
  await page.goto('/competitor-analysis');
  
  // フォーム入力
  await page.fill('[data-testid=name-input]', 'テスト太郎');
  await page.click('[data-testid=submit-button]');
  
  // 結果表示の確認
  await page.waitForSelector('[data-testid=analysis-results]');
  
  const competitorCount = await page.locator('[data-testid=competitor-row]').count();
  expect(competitorCount).toBeGreaterThan(0);
});
```

### 6.2 パフォーマンス最適化

#### 6.2.1 フロントエンド最適化
- React.memoによるレンダリング最適化
- useMemoとuseCallbackの適切な使用
- 画像の最適化（Next.js Image）
- バンドルサイズの最適化

#### 6.2.2 バックエンド最適化
- データベースクエリの最適化
- APIレスポンスのキャッシュ
- 非同期処理の最適化
- メモリリークの防止

### 6.3 Git ワークフローとデプロイ

#### 6.3.1 開発ブランチ戦略
```bash
# 機能ブランチ作成
git checkout -b feat/competitor-analysis-dashboard

# 実装完了後
git add .
git commit -m "feat: implement competitor analysis dashboard

- Add search form with validation
- Implement analysis API endpoints
- Add results visualization components
- Include CSV export functionality

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# プッシュとPR作成
git push -u origin feat/competitor-analysis-dashboard
gh pr create --title "競合分析ダッシュボード機能の実装" --body "MVP機能1の実装完了"
```

#### 6.3.2 品質チェック
```bash
# リント・型チェック・テスト実行
npm run lint
npm run build
npm run test
npm run test:e2e
```

**タスク**:
- [ ] 単体テスト実装
- [ ] 統合テスト実装
- [ ] E2Eテスト実装
- [ ] パフォーマンス最適化
- [ ] ブランチ作成・実装・コミット・プッシュ
- [ ] PR作成

**想定工数**: 8時間

## 7. 実装スケジュール

### 7.1 タイムライン
- **Phase 1**: 1日目（4時間）
- **Phase 2**: 2-3日目（12時間）
- **Phase 3**: 4-5日目（10時間） 
- **Phase 4**: 6-7日目（14時間）
- **Phase 5**: 8日目（8時間）

**総想定工数**: 48時間（約8営業日）

### 7.2 リスクと対策
- **外部API制限**: フォールバック機能実装
- **パフォーマンス問題**: キャッシュ戦略強化
- **UI/UX課題**: ユーザビリティテスト実施

### 7.3 完了基準
- ✅ 全ての受け入れ基準をクリア
- ✅ テスト カバレッジ80%以上
- ✅ パフォーマンス目標達成（15秒以内分析完了）
- ✅ アクセシビリティ基準準拠
- ✅ 本番環境でのエラーフリー稼働

## 8. 次のステップ

この実装計画に基づいて、Phase 1から順次実装を開始します。各フェーズ完了後に進捗確認とユーザーフィードバックを行い、必要に応じて計画を調整します。

実装開始の承認をいただけましたら、即座にPhase 1のタスクに着手いたします。