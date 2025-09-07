'use client';

import { Recommendation, RecommendationType } from '@/types/analysis';

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export default function RecommendationsList({ recommendations = [] }: RecommendationsListProps) {
  const getRecommendationTypeColor = (type: RecommendationType) => {
    switch (type) {
      case 'immediate': return 'bg-green-50 border-green-200 text-green-800';
      case 'medium_term': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'long_term': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getRecommendationTypeLabel = (type: RecommendationType) => {
    switch (type) {
      case 'immediate': return '即座に取り組み';
      case 'medium_term': return '中期的な取り組み';
      case 'long_term': return '長期的な戦略';
      default: return 'その他';
    }
  };

  const getRecommendationIcon = (type: RecommendationType) => {
    switch (type) {
      case 'immediate':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
      case 'medium_term':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'long_term':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getPriorityBadge = (priorityScore: number) => {
    if (priorityScore >= 8) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">高優先度</span>;
    }
    if (priorityScore >= 5) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">中優先度</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">低優先度</span>;
  };

  const sortedRecommendations = [...recommendations].sort((a, b) => b.priorityScore - a.priorityScore);

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">推奨アクション</h3>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">推奨アクションなし</h3>
          <p className="mt-1 text-sm text-gray-500">現在、具体的な推奨アクションはありません。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">推奨アクション</h3>
        <p className="text-sm text-gray-600 mt-1">
          優先度順に表示されています。即座に取り組める項目から始めることをお勧めします。
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {sortedRecommendations.map((recommendation) => (
          <div key={recommendation.id} className="p-6">
            <div className="flex items-start">
              {getRecommendationIcon(recommendation.type)}
              
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getRecommendationTypeColor(recommendation.type)}`}>
                      {getRecommendationTypeLabel(recommendation.type)}
                    </span>
                    {getPriorityBadge(recommendation.priorityScore)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>優先度スコア: {recommendation.priorityScore}/10</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-900 leading-relaxed">
                  {recommendation.description}
                </p>
                
                {/* アクション提案の詳細化 */}
                <div className="mt-3 bg-gray-50 rounded-md p-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">具体的なアクション:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {recommendation.type === 'immediate' && (
                      <>
                        <li>• 競合強度が低いポジションを狙ったコンテンツ作成</li>
                        <li>• 基本的なSEO対策（タイトル、メタディスクリプション）の実施</li>
                        <li>• ソーシャルメディアでの情報発信開始</li>
                      </>
                    )}
                    {recommendation.type === 'medium_term' && (
                      <>
                        <li>• 継続的なコンテンツ更新とSEO最適化</li>
                        <li>• 関連キーワードでの記事作成</li>
                        <li>• 外部サイトからのリンク獲得活動</li>
                      </>
                    )}
                    {recommendation.type === 'long_term' && (
                      <>
                        <li>• 複合キーワード戦略の策定と実行</li>
                        <li>• ドメインオーソリティ向上のための長期施策</li>
                        <li>• 専門性を活かしたコンテンツマーケティング</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 全体的なアドバイス */}
      <div className="p-6 bg-blue-50 border-t border-gray-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              個人名SEOのコツ
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                個人名での上位表示は継続的な取り組みが重要です。
                まずは即座に取り組める項目から始めて、段階的に長期的な戦略を実行していきましょう。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}