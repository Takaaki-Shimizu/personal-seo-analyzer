'use client';

import { AnalysisData } from '@/types/analysis';

interface ExportButtonProps {
  data: AnalysisData;
}

export default function ExportButton({ data }: ExportButtonProps) {
  const convertToCSV = (analysisData: AnalysisData): string => {
    const headers = [
      '順位',
      'URL',
      'タイトル',
      'ドメイン',
      'ドメインオーソリティ',
      'コンテンツタイプ',
      '競合強度',
      '本人のコンテンツ',
    ];

    const csvRows = [
      headers.join(','),
      ...(analysisData.searchResults || []).map(result => [
        result.rank,
        `"${result.url}"`,
        `"${result.title.replace(/"/g, '""')}"`,
        result.domain,
        result.domainAuthority,
        result.contentType,
        result.competitiveStrength,
        result.isTargetPerson ? 'はい' : 'いいえ',
      ].join(','))
    ];

    // BOMを追加してExcelで正しく文字化けしないようにする
    const BOM = '\uFEFF';
    return BOM + csvRows.join('\n');
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleExport = () => {
    try {
      const csvData = convertToCSV(data);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `competitor-analysis-${data.searchQuery}-${timestamp}.csv`;
      downloadCSV(csvData, filename);
      
      // 成功メッセージを表示（簡易的な実装）
      if (window.confirm('CSVファイルのダウンロードが開始されました。')) {
        // ユーザーが確認した場合の処理（必要に応じて）
      }
    } catch (error) {
      console.error('CSV export error:', error);
      alert('CSVエクスポートに失敗しました。再度お試しください。');
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handleExport}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        CSVダウンロード
      </button>
      
      {/* エクスポート情報 */}
      <div className="text-sm text-gray-500">
        <p>{(data.searchResults || []).length}件のデータをエクスポート</p>
      </div>
    </div>
  );
}