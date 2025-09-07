'use client';

import { AnalysisSummary } from '@/types/analysis';

interface ResultsSummaryProps {
  analysis: AnalysisSummary;
  searchQuery: string;
}

export default function ResultsSummary({ analysis, searchQuery }: ResultsSummaryProps) {
  const { 
    totalCompetitors = 0, 
    strongCompetitors = 0, 
    opportunities = 0, 
    averageDomainAuthority = 0 
  } = analysis || {};

  const competitiveStrengthPercentage = totalCompetitors > 0 
    ? Math.round((strongCompetitors / totalCompetitors) * 100) 
    : 0;

  const opportunityPercentage = totalCompetitors > 0 
    ? Math.round((opportunities / totalCompetitors) * 100) 
    : 0;

  const getCompetitionLevel = () => {
    if (competitiveStrengthPercentage >= 60) return { level: '高', color: 'text-red-600', bg: 'bg-red-100' };
    if (competitiveStrengthPercentage >= 30) return { level: '中', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: '低', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getDomainAuthorityLevel = () => {
    if (averageDomainAuthority >= 60) return { level: '高', color: 'text-red-600' };
    if (averageDomainAuthority >= 40) return { level: '中', color: 'text-yellow-600' };
    return { level: '低', color: 'text-green-600' };
  };

  const competition = getCompetitionLevel();
  const domainLevel = getDomainAuthorityLevel();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">分析結果サマリー</h2>
        <p className="text-gray-600">
          検索キーワード: <span className="font-medium text-gray-900">&quot;{searchQuery}&quot;</span>
        </p>
      </div>

      {/* メインサマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総競合数</p>
              <p className="text-2xl font-bold text-gray-900">{totalCompetitors}</p>
            </div>
            <div className="p-3 bg-gray-200 rounded-full">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">強い競合</p>
              <p className="text-2xl font-bold text-red-900">{strongCompetitors}</p>
              <p className="text-xs text-red-600">{competitiveStrengthPercentage}% of total</p>
            </div>
            <div className="p-3 bg-red-200 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">機会領域</p>
              <p className="text-2xl font-bold text-green-900">{opportunities}</p>
              <p className="text-xs text-green-600">{opportunityPercentage}% of total</p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">平均DA</p>
              <p className="text-2xl font-bold text-blue-900">{averageDomainAuthority}</p>
              <p className={`text-xs ${domainLevel.color}`}>レベル: {domainLevel.level}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 競合状況の評価 */}
      <div className={`${competition.bg} rounded-lg p-4`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-3 h-3 rounded-full ${competition.color.replace('text-', 'bg-')}`}></div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              競合レベル: <span className={competition.color}>{competition.level}</span>
            </p>
            <p className="text-sm text-gray-700 mt-1">
              {competitiveStrengthPercentage >= 60 && '競合が非常に強く、長期的な戦略が必要です。複合キーワードでの差別化を検討してください。'}
              {competitiveStrengthPercentage >= 30 && competitiveStrengthPercentage < 60 && '適度な競合環境です。質の高いコンテンツで上位表示が可能です。'}
              {competitiveStrengthPercentage < 30 && '競合が比較的弱く、SEO施策により上位表示のチャンスがあります。'}
            </p>
          </div>
        </div>
      </div>

      {/* 機会領域のハイライト */}
      {opportunities > 0 && (
        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>機会発見!</strong> {opportunities}件の狙い目ポジションがあります。
                詳細な分析結果で具体的なアクションプランを確認してください。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}