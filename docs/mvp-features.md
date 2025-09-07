# Personal SEO Analyzer - MVP機能詳細

## 機能1: 同名競合分析ダッシュボード

### 概要
ユーザーが入力した名前でGoogle検索を実行し、上位結果を分析して競合状況を可視化する。同名の人物や関連サイトの強さを定量評価し、勝機のある領域を特定する。

### 主な機能

#### 1.1 検索結果取得・分析
- **入力**: 分析対象の名前（姓名）
- **処理**: Google Custom Search API で上位10-20件を取得
- **分析内容**:
  - 同名人物の特定
  - ドメインオーソリティの測定
  - コンテンツタイプの分類（Wikipedia、SNS、ニュース記事等）

#### 1.2 競合スコアリング
```typescript
interface CompetitorScore {
  rank: number;
  url: string;
  title: string;
  domain: string;
  domainAuthority: number;
  contentType: 'person' | 'news' | 'social' | 'other';
  competitiveStrength: 'high' | 'medium' | 'low';
  isTargetPerson: boolean;
}
```

#### 1.3 勝機領域の特定
- 競合の薄い検索結果ポジション
- ドメインオーソリティが低い競合
- 古いコンテンツで更新されていない競合

### UI/UX 設計

#### ダッシュボード構成
1. **検索フォーム**: シンプルな名前入力
2. **結果サマリー**: 競合の強さを一目で把握
3. **詳細分析表**: 順位別の競合情報
4. **勝機レーダー**: 視覚的な機会分析

#### 表示項目
- 検索順位
- サイトタイトル・URL
- ドメインオーソリティスコア
- 競合強度（色分け）
- アクション提案

### 実装仕様

#### API エンドポイント
```typescript
// POST /api/search
interface SearchAnalysisRequest {
  name: string;
  location?: string; // 地域指定
  searchCount?: number; // 取得件数 (default: 10)
}

interface SearchAnalysisResponse {
  success: boolean;
  data: {
    searchResults: SearchResult[];
    analysis: {
      totalCompetitors: number;
      strongCompetitors: number;
      opportunities: number;
      averageDomainAuthority: number;
    };
    recommendations: string[];
  };
  error?: string;
}
```

#### データ取得フロー
1. Google Custom Search API で検索実行
2. 各URLのドメインオーソリティを Moz API で取得
3. コンテンツタイプの自動分類
4. 競合強度の算出
5. 機会領域の特定

---

## 機能2: 個人名用キーワード提案エンジン

### 概要
単体名での上位表示は困難なため、戦略的な複合キーワードを提案する。職業・専門分野と組み合わせたキーワードで勝ちやすい領域を特定。

### 主な機能

#### 2.1 複合キーワード生成
- **ベース**: ユーザーの名前
- **組み合わせ要素**:
  - 職業（エンジニア、デザイナー、コンサルタント等）
  - 専門分野（Python、SEO、マーケティング等）
  - 地域（東京、大阪等）
  - 属性（フリーランス、起業家等）

#### 2.2 キーワード評価
```typescript
interface KeywordData {
  keyword: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  difficulty: number; // 1-100
  opportunity: number; // 勝ちやすさスコア
  cpc?: number; // 参考値
}
```

#### 2.3 優先順位付け
- 検索ボリューム vs 競合難易度のバランス
- ユーザーの専門性との適合度
- 短期・中期・長期での取り組み提案

### UI/UX 設計

#### キーワード提案画面
1. **プロフィール入力**: 職業・専門分野の選択
2. **キーワード一覧**: 難易度順・機会順での表示
3. **詳細分析**: 各キーワードの深掘り情報
4. **戦略提案**: 取り組み順序の推奨

#### フィルタリング機能
- 難易度レベル
- 検索ボリューム範囲
- キーワードタイプ（職業系、地域系等）

### 実装仕様

#### API エンドポイント
```typescript
// POST /api/keywords
interface KeywordSuggestionRequest {
  name: string;
  profession: string[];
  skills: string[];
  location?: string;
  experience?: 'beginner' | 'intermediate' | 'expert';
}

interface KeywordSuggestionResponse {
  success: boolean;
  data: {
    keywords: KeywordData[];
    strategy: {
      shortTerm: KeywordData[]; // 3ヶ月以内
      mediumTerm: KeywordData[]; // 6ヶ月以内
      longTerm: KeywordData[]; // 1年以内
    };
    tips: string[];
  };
}
```

#### キーワード生成ロジック
1. プロフィール情報からベースキーワード生成
2. Google Keyword Planner で検索ボリューム取得
3. 競合分析で難易度算出
4. 機会スコアの計算
5. 戦略的優先順位付け

---

## 機能3: デジタル資産チェッカー

### 概要
個人名SEOに重要な各プラットフォームでの存在確認と最適化度チェック。SNS、プロフェッショナルネットワーク、技術系プラットフォームでの露出状況を評価。

### 主な機能

#### 3.1 プラットフォーム存在確認
- **対象プラットフォーム**:
  - LinkedIn
  - GitHub
  - Twitter/X
  - Facebook
  - Instagram
  - YouTube
  - Qiita
  - Zenn
  - note

#### 3.2 最適化度評価
```typescript
interface PlatformStatus {
  platform: string;
  exists: boolean;
  profileUrl?: string;
  optimizationScore: number; // 0-100
  issues: OptimizationIssue[];
  recommendations: string[];
}

interface OptimizationIssue {
  type: 'missing_bio' | 'no_profile_image' | 'inactive' | 'keyword_missing';
  severity: 'high' | 'medium' | 'low';
  description: string;
  solution: string;
}
```

#### 3.3 アクション提案
- 作成すべきアカウントの優先順位
- 既存アカウントの改善点
- プロフィール最適化のガイドライン

### UI/UX 設計

#### チェック結果画面
1. **プラットフォーム一覧**: 存在状況の可視化
2. **スコアダッシュボード**: 全体最適化度
3. **詳細レポート**: プラットフォーム別の改善提案
4. **アクションプラン**: 優先順位付きタスクリスト

#### 進捗トラッキング
- 改善前後の比較
- スコア推移のグラフ表示
- 完了済みタスクの管理

### 実装仕様

#### API エンドポイント
```typescript
// POST /api/digital-assets
interface DigitalAssetRequest {
  name: string;
  profession?: string;
  targetPlatforms?: string[]; // 指定がない場合は全プラットフォーム
}

interface DigitalAssetResponse {
  success: boolean;
  data: {
    platforms: PlatformStatus[];
    overallScore: number;
    priorityActions: PriorityAction[];
    insights: {
      strongPlatforms: string[];
      weakPlatforms: string[];
      missingPlatforms: string[];
    };
  };
}

interface PriorityAction {
  platform: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
  timeRequired: string;
}
```

#### チェック実装方法
1. **存在確認**: 各プラットフォームの検索機能を活用
2. **プロフィール分析**: 公開情報の取得・評価
3. **最適化評価**: プリセットルールでスコアリング
4. **改善提案**: ベストプラクティスとの比較

---

## 共通仕様

### 認証・ユーザー管理
- Supabase Auth による認証
- Google/GitHub ソーシャルログイン
- ユーザープロフィール管理

### データ保存
- 分析結果のキャッシュ（24時間）
- ユーザーの分析履歴
- プロフィール情報

### エラーハンドリング
- API制限時の適切なメッセージ
- ネットワークエラーの対応
- ユーザーフレンドリーなエラー表示

### パフォーマンス
- 分析処理の非同期実行
- プログレスバーでの進捗表示
- 結果のページネーション（必要に応じて）

### レスポンシブ対応
- モバイル・タブレット・デスクトップ対応
- Touch-friendly UI
- 適切なブレークポイント設定