# Personal SEO Analyzer - アーキテクチャ設計

## 技術スタック概要

### フロントエンド
- **Next.js 14** (App Router)
- **TypeScript** (型安全性)
- **Tailwind CSS** (高速UI開発)
- **Radix UI** (アクセシブルなコンポーネント)
- **Lucide React** (アイコン)

### バックエンド
- **Next.js API Routes** (同一プロジェクト内)
- **TypeScript** (フロントエンドと型共有)

### データベース
- **Supabase** (PostgreSQL)
  - ユーザー認証機能内蔵
  - リアルタイム機能対応
  - TypeScript対応

### 外部API
- **Google Custom Search API** (検索結果取得)
- **Moz API** (ドメインオーソリティ取得)
- **Google Keyword Planner API** (キーワード情報)

### ホスティング・デプロイ
- **Vercel** (フロントエンド・API Routes)
- **Supabase** (データベース・認証)

## システム構成図

```
[ユーザー] 
    ↓
[Vercel - Next.js Frontend]
    ↓
[Next.js API Routes]
    ↓
[外部API群] + [Supabase DB]
```

## ディレクトリ構造

```
personal-seo-analyzer/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── dashboard/
│   │   │   ├── analysis/
│   │   │   ├── keywords/
│   │   │   └── digital-assets/
│   │   ├── api/
│   │   │   ├── search/
│   │   │   │   └── route.ts
│   │   │   ├── keywords/
│   │   │   │   └── route.ts
│   │   │   ├── digital-assets/
│   │   │   │   └── route.ts
│   │   │   └── auth/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/ (Radix UI components)
│   │   ├── analysis/
│   │   │   ├── CompetitorAnalysis.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   └── ScoreCard.tsx
│   │   ├── keywords/
│   │   │   ├── KeywordSuggestions.tsx
│   │   │   └── DifficultyMeter.tsx
│   │   ├── digital-assets/
│   │   │   ├── PlatformChecker.tsx
│   │   │   └── OptimizationTips.tsx
│   │   └── common/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── LoadingSpinner.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── apis/
│   │   │   ├── google-search.ts
│   │   │   ├── moz.ts
│   │   │   └── keyword-planner.ts
│   │   ├── utils.ts
│   │   └── validations.ts
│   ├── types/
│   │   ├── database.ts
│   │   ├── api-responses.ts
│   │   └── index.ts
│   └── hooks/
│       ├── useAnalysis.ts
│       ├── useKeywords.ts
│       └── useAuth.ts
├── public/
├── docs/
├── .env.local
├── package.json
└── README.md
```

## データベース設計

### users テーブル
```sql
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### analysis_results テーブル
```sql
CREATE TABLE analysis_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_name TEXT NOT NULL,
  search_results JSONB,
  competitor_scores JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### keyword_suggestions テーブル
```sql
CREATE TABLE keyword_suggestions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  base_name TEXT NOT NULL,
  suggestions JSONB,
  difficulty_scores JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### digital_asset_checks テーブル
```sql
CREATE TABLE digital_asset_checks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_name TEXT NOT NULL,
  platform_results JSONB,
  optimization_scores JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API 設計

### 同名競合分析 API
```typescript
// GET /api/search
interface SearchAnalysisRequest {
  name: string;
  limit?: number;
}

interface SearchAnalysisResponse {
  results: SearchResult[];
  competitorAnalysis: CompetitorScore[];
  recommendations: string[];
}
```

### キーワード提案 API
```typescript
// GET /api/keywords
interface KeywordSuggestionRequest {
  name: string;
  profession?: string;
  industry?: string;
}

interface KeywordSuggestionResponse {
  suggestions: KeywordData[];
  difficulty: DifficultyScore[];
  opportunities: OpportunityKeyword[];
}
```

### デジタル資産チェック API
```typescript
// GET /api/digital-assets
interface DigitalAssetRequest {
  name: string;
  platforms: Platform[];
}

interface DigitalAssetResponse {
  platformStatus: PlatformStatus[];
  optimizationTips: OptimizationTip[];
  priorityActions: PriorityAction[];
}
```

## セキュリティ設計

### 認証・認可
- Supabase Auth を利用
- Row Level Security (RLS) でデータアクセス制御
- API Routes レベルでの認証チェック

### API制限
- レート制限実装 (ユーザー毎)
- API使用量の監視
- 外部API のコスト管理

### データ保護
- 個人情報の暗号化
- 検索履歴の適切な管理
- GDPR準拠のデータ削除機能

## パフォーマンス最適化

### キャッシュ戦略
- 検索結果の一時キャッシュ (Redis/Upstash)
- 静的データの CDN キャッシュ
- クライアントサイドキャッシュ (SWR)

### 最適化手法
- Next.js の Image Optimization
- API Response の最小化
- Lazy Loading の実装

## 運用・監視

### ログ・監視
- Vercel Analytics
- Supabase の内蔵監視機能
- エラー追跡 (Sentry)

### デプロイ戦略
- Git ベースの自動デプロイ (Vercel)
- 環境変数の管理
- データベースマイグレーション

## スケーラビリティ

### 初期段階（MVP）
- 単一 Next.js アプリケーション
- Supabase の無料枠内での運用

### 成長段階
- API の分離 (必要に応じて)
- データベースの分散化
- CDN の本格活用

### 将来的な拡張
- マイクロサービス化
- 機械学習機能の追加
- リアルタイム機能の強化