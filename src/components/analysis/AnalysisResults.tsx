'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import ResultsSummary from './ResultsSummary';
import CompetitorTable from './CompetitorTable';
import OpportunityRadar from './OpportunityRadar';
import RecommendationsList from './RecommendationsList';
import ExportButton from './ExportButton';
import { AnalysisDetailResponse } from '@/types/analysis';

interface AnalysisResultsProps {
  analysisId: string;
}

const fetcher = async (url: string): Promise<AnalysisDetailResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('分析結果の取得に失敗しました');
  }
  return res.json();
};

function AnalysisLoading() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">分析中...</h3>
        <p className="text-gray-600 mb-4">
          Google検索結果を取得し、競合分析を実行しています。
        </p>
        <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-800">進行状況</span>
            <span className="text-blue-600">約15秒お待ちください</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorDisplay({ error }: { error: unknown }) {
  const getErrorMessage = (error: unknown) => {
    if (error && typeof error === 'object' && 'error' in error && error.error && typeof error.error === 'object' && 'message' in error.error) {
      return String(error.error.message);
    }
    if (typeof error === 'string') {
      return error;
    }
    return '分析結果の取得中にエラーが発生しました';
  };

  const getErrorCode = (error: unknown) => {
    if (error && typeof error === 'object' && 'error' in error && error.error && typeof error.error === 'object' && 'code' in error.error) {
      return String(error.error.code);
    }
    return 'UNKNOWN_ERROR';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">エラーが発生しました</h3>
        <p className="text-gray-600 mb-4">
          {getErrorMessage(error)}
        </p>
        <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-gray-500">
            エラーコード: {getErrorCode(error)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            問題が継続する場合は、しばらく時間をおいてから再度お試しください。
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          ページを再読み込み
        </button>
      </div>
    </div>
  );
}

export default function AnalysisResults({ analysisId }: AnalysisResultsProps) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/search/${analysisId}`,
    fetcher,
    {
      refreshInterval: (data) => {
        // 分析が完了していない場合は5秒ごとにポーリング
        return data?.data?.status !== 'completed' ? 5000 : 0;
      },
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  useEffect(() => {
    // 分析が完了した場合はポーリングを停止
    if (data?.data?.status === 'completed') {
      mutate(); // 最終データを確実に取得
    }
  }, [data?.data?.status, mutate]);

  // ローディング状態
  if (isLoading || data?.data?.status === 'processing') {
    return <AnalysisLoading />;
  }

  // エラー状態
  if (error || !data?.success) {
    return <ErrorDisplay error={error || data} />;
  }

  // 分析失敗状態
  if (data.data?.status === 'failed') {
    return (
      <ErrorDisplay 
        error={{
          error: {
            code: 'ANALYSIS_FAILED',
            message: '分析処理が失敗しました。再度お試しください。'
          }
        }}
      />
    );
  }

  const { searchResults, analysis, recommendations, searchQuery } = data.data;

  return (
    <div className="space-y-8">
      {/* 結果サマリー */}
      <ResultsSummary analysis={analysis} searchQuery={searchQuery} />
      
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
      
      {/* 分析完了メッセージ */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-700">
              <strong>分析完了!</strong> 競合分析が正常に完了しました。
              推奨アクションに従って、SEO改善を進めてください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}