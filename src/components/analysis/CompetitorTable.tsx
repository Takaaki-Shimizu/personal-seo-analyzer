'use client';

import { useState } from 'react';
import { CompetitorScore, CompetitiveStrength, ContentType } from '@/types/analysis';

interface CompetitorTableProps {
  competitors: CompetitorScore[];
}

export default function CompetitorTable({ competitors }: CompetitorTableProps) {
  const [sortBy, setSortBy] = useState<'rank' | 'domainAuthority' | 'competitiveStrength'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterBy, setFilterBy] = useState<'all' | CompetitiveStrength>('all');

  const getCompetitiveStrengthColor = (strength: CompetitiveStrength) => {
    switch (strength) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getContentTypeIcon = (contentType: ContentType) => {
    switch (contentType) {
      case 'person':
        return <span className="text-blue-600">👤</span>;
      case 'social':
        return <span className="text-purple-600">📱</span>;
      case 'news':
        return <span className="text-red-600">📰</span>;
      default:
        return <span className="text-gray-600">📄</span>;
    }
  };

  const getContentTypeLabel = (contentType: ContentType) => {
    switch (contentType) {
      case 'person': return '個人プロフィール';
      case 'social': return 'SNS';
      case 'news': return 'ニュース';
      default: return 'その他';
    }
  };

  const getDomainAuthorityColor = (da: number) => {
    if (da >= 70) return 'text-red-600 font-bold';
    if (da >= 50) return 'text-orange-600 font-semibold';
    if (da >= 30) return 'text-yellow-600 font-medium';
    return 'text-green-600';
  };

  const sortedAndFilteredCompetitors = competitors
    .filter(competitor => filterBy === 'all' || competitor.competitiveStrength === filterBy)
    .sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'rank':
          aValue = a.rank;
          bValue = b.rank;
          break;
        case 'domainAuthority':
          aValue = a.domainAuthority;
          bValue = b.domainAuthority;
          break;
        case 'competitiveStrength':
          const strengthOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          aValue = strengthOrder[a.competitiveStrength];
          bValue = strengthOrder[b.competitiveStrength];
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">詳細競合分析</h3>
        
        {/* フィルターとソート */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">フィルター:</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as typeof filterBy)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="high">競合強度: 高</option>
              <option value="medium">競合強度: 中</option>
              <option value="low">競合強度: 低</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('rank')}
              >
                <div className="flex items-center">
                  順位
                  {sortBy === 'rank' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タイプ
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                サイト情報
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('domainAuthority')}
              >
                <div className="flex items-center">
                  DA
                  {sortBy === 'domainAuthority' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('competitiveStrength')}
              >
                <div className="flex items-center">
                  競合強度
                  {sortBy === 'competitiveStrength' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredCompetitors.map((competitor) => (
              <tr key={competitor.url} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-800">
                          {competitor.rank}
                        </span>
                      </div>
                    </div>
                    {competitor.isTargetPerson && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        本人
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getContentTypeIcon(competitor.contentType)}
                    <span className="ml-2 text-sm text-gray-900">
                      {getContentTypeLabel(competitor.contentType)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium truncate max-w-xs">
                    {competitor.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    <a 
                      href={competitor.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 truncate block max-w-xs"
                    >
                      {competitor.domain}
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${getDomainAuthorityColor(competitor.domainAuthority)}`}>
                    {competitor.domainAuthority}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getCompetitiveStrengthColor(competitor.competitiveStrength)}`}>
                    {competitor.competitiveStrength === 'high' && '高'}
                    {competitor.competitiveStrength === 'medium' && '中'}
                    {competitor.competitiveStrength === 'low' && '低'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {competitor.competitiveStrength === 'low' && (
                    <span className="text-green-600 font-medium">狙い目</span>
                  )}
                  {competitor.competitiveStrength === 'medium' && (
                    <span className="text-yellow-600">要対策</span>
                  )}
                  {competitor.competitiveStrength === 'high' && (
                    <span className="text-red-600">長期戦略</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}