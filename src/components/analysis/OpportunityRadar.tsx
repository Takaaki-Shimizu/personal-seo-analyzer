'use client';

import { CompetitorScore } from '@/types/analysis';

interface OpportunityRadarProps {
  competitors: CompetitorScore[];
}

export default function OpportunityRadar({ competitors = [] }: OpportunityRadarProps) {
  const calculateOpportunityMetrics = () => {
    const total = competitors.length;
    if (total === 0) return { low: 0, medium: 0, high: 0 };

    const counts = competitors.reduce(
      (acc, competitor) => {
        acc[competitor.competitiveStrength]++;
        return acc;
      },
      { low: 0, medium: 0, high: 0 }
    );

    return {
      low: Math.round((counts.low / total) * 100),
      medium: Math.round((counts.medium / total) * 100),
      high: Math.round((counts.high / total) * 100),
    };
  };

  const getTopOpportunities = () => {
    return competitors
      .filter(c => c.competitiveStrength === 'low' || c.domainAuthority < 30)
      .slice(0, 5)
      .map(c => ({
        rank: c.rank,
        title: c.title,
        reason: c.competitiveStrength === 'low' ? '競合強度が低い' : 'ドメインオーソリティが低い',
        impactScore: 11 - c.rank,
      }))
      .sort((a, b) => b.impactScore - a.impactScore);
  };

  const metrics = calculateOpportunityMetrics();
  const topOpportunities = getTopOpportunities();

  const RadialProgress = ({ 
    percentage, 
    color, 
    label, 
    size = 120 
  }: { 
    percentage: number; 
    color: string; 
    label: string; 
    size?: number;
  }) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgb(229, 231, 235)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-sm font-medium text-gray-700 text-center">
          {label}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">機会分析レーダー</h3>
        <p className="text-sm text-gray-600">
          競合強度の分布と狙い目のポジションを可視化しています
        </p>
      </div>

      <div className="p-6">
        {/* 競合強度の分布 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <RadialProgress
            percentage={metrics.low}
            color="#10B981"
            label="競合強度: 低"
          />
          <RadialProgress
            percentage={metrics.medium}
            color="#F59E0B"
            label="競合強度: 中"
          />
          <RadialProgress
            percentage={metrics.high}
            color="#EF4444"
            label="競合強度: 高"
          />
        </div>

        {/* 機会分析サマリー */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">機会分析サマリー</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.low}%</div>
              <div className="text-sm text-gray-600">即座に狙える領域</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{metrics.medium}%</div>
              <div className="text-sm text-gray-600">中期戦略対象</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.high}%</div>
              <div className="text-sm text-gray-600">長期戦略が必要</div>
            </div>
          </div>
        </div>

        {/* トップ機会リスト */}
        {topOpportunities.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">トップ機会ポジション</h4>
            <div className="space-y-3">
              {topOpportunities.map((opportunity, index) => (
                <div
                  key={index}
                  className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-800">
                      {opportunity.rank}
                    </span>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {opportunity.title}
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      {opportunity.reason} • インパクトスコア: {opportunity.impactScore}/10
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      狙い目
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 機会がない場合のメッセージ */}
        {topOpportunities.length === 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">競合が強力です</h3>
            <p className="text-gray-600">
              現在、明確な機会領域は見つかりませんでした。<br />
              長期的な戦略と複合キーワードでの差別化を検討してください。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}