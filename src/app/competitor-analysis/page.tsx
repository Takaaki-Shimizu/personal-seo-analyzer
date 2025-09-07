'use client';

import { useState } from 'react';
import SearchForm from '@/components/analysis/SearchForm';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import { SearchFormData } from '@/lib/validations';
import { SearchAnalysisResponse } from '@/types/analysis';

export default function CompetitorAnalysisPage() {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleSearchSubmit = async (data: SearchFormData) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data),
      });
      
      const result: SearchAnalysisResponse = await response.json();
      
      if (result.success && result.data) {
        setAnalysisId(result.data.analysisId);
      } else {
        setError(result.error?.message || '分析の開始に失敗しました');
      }
    } catch (error) {
      console.error('分析の開始に失敗しました:', error);
      setError('ネットワークエラーが発生しました。再度お試しください。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisId(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              同名競合分析ダッシュボード
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              あなたの名前でGoogle検索した時の競合状況を分析し、
              個人名SEOの改善点と具体的なアクションプランをご提案します。
            </p>
          </div>

          {/* 機能説明カード */}
          {!analysisId && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">競合分析</h3>
                <p className="text-gray-600 text-sm">
                  Google検索結果の上位サイトを分析し、ドメインオーソリティや競合強度を評価します。
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">機会発見</h3>
                <p className="text-gray-600 text-sm">
                  競合の弱い領域や狙い目のポジションを特定し、勝機のある戦略を提案します。
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">アクション提案</h3>
                <p className="text-gray-600 text-sm">
                  即座に取り組めるものから長期戦略まで、優先度付きでアクションプランを提示します。
                </p>
              </div>
            </div>
          )}
          
          {/* エラー表示 */}
          {error && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 検索フォームまたは結果表示 */}
          {!analysisId ? (
            <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
              <SearchForm onSubmit={handleSearchSubmit} isLoading={isAnalyzing} />
            </div>
          ) : (
            <div>
              {/* 新しい分析開始ボタン */}
              <div className="mb-6 text-center">
                <button
                  onClick={handleNewAnalysis}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  新しい分析を開始
                </button>
              </div>
              
              {/* 分析結果 */}
              <AnalysisResults analysisId={analysisId} />
            </div>
          )}
          
          {/* フッター情報 */}
          <div className="mt-12 text-center text-sm text-gray-500">
            <p>
              個人名SEOの改善にお困りの方は、分析結果をもとに継続的な施策を実施してください。
            </p>
            <p className="mt-2">
              より詳しい相談が必要な場合は、SEOの専門家にご相談することをお勧めします。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}