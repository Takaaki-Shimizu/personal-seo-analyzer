import { 
  SearchResult, 
  DomainMetrics, 
  CompetitorScore, 
  ContentType, 
  CompetitiveStrength,
  Opportunity,
  Recommendation,
  AnalysisSummary
} from '@/types/analysis';

export class AnalysisEngine {
  classifyContentType(result: SearchResult): ContentType {
    const url = result.url.toLowerCase();
    const title = result.title.toLowerCase();
    const snippet = result.snippet?.toLowerCase() || '';

    if (this.isPersonProfile(url, title, snippet)) {
      return 'person';
    }

    if (this.isSocialMedia(url)) {
      return 'social';
    }

    if (this.isNewsContent(url, title)) {
      return 'news';
    }

    return 'other';
  }

  private isPersonProfile(url: string, title: string, snippet: string): boolean {
    const personIndicators = [
      'linkedin.com/in/',
      'facebook.com/',
      'twitter.com/',
      'instagram.com/',
      'profile',
      'プロフィール',
      '経歴',
      'about',
    ];

    return personIndicators.some(indicator => 
      url.includes(indicator) || title.includes(indicator) || snippet.includes(indicator)
    );
  }

  private isSocialMedia(url: string): boolean {
    const socialDomains = [
      'twitter.com',
      'facebook.com',
      'instagram.com',
      'linkedin.com',
      'youtube.com',
      'tiktok.com',
    ];

    return socialDomains.some(domain => url.includes(domain));
  }

  private isNewsContent(url: string, title: string): boolean {
    const newsDomains = [
      'asahi.com',
      'mainichi.jp',
      'yomiuri.co.jp',
      'sankei.com',
      'nikkei.com',
      'jiji.com',
      'kyodo.co.jp',
      'news.',
      'press',
    ];

    const newsKeywords = ['ニュース', 'news', '記事', 'article', '報道', 'press'];

    return newsDomains.some(domain => url.includes(domain)) ||
           newsKeywords.some(keyword => title.includes(keyword));
  }

  calculateCompetitiveStrength(
    result: SearchResult, 
    domainMetrics: DomainMetrics, 
    targetName: string
  ): CompetitiveStrength {
    const { domainAuthority } = domainMetrics;
    const contentType = this.classifyContentType(result);
    const isTargetPerson = this.isTargetPerson(result, targetName);

    if (isTargetPerson) {
      return 'low';
    }

    if (domainAuthority >= 70 || this.isHighAuthorityContent(result.url)) {
      return 'high';
    }

    if (domainAuthority >= 30 && (contentType === 'news' || contentType === 'social')) {
      return 'medium';
    }

    if (domainAuthority < 30) {
      return 'low';
    }

    return 'medium';
  }

  private isTargetPerson(result: SearchResult, targetName: string): boolean {
    const title = result.title.toLowerCase();
    const snippet = result.snippet?.toLowerCase() || '';
    const name = targetName.toLowerCase();
    
    const personalIndicators = [
      'my',
      'portfolio',
      'blog',
      'ポートフォリオ',
      'ブログ',
      '公式',
      'official',
    ];

    return personalIndicators.some(indicator => 
      title.includes(indicator) && (title.includes(name) || snippet.includes(name))
    );
  }

  private isHighAuthorityContent(url: string): boolean {
    const highAuthorityDomains = [
      'wikipedia.org',
      'gov.jp',
      'edu',
      '.ac.jp',
    ];

    return highAuthorityDomains.some(domain => url.includes(domain));
  }

  identifyOpportunities(competitors: CompetitorScore[]): Opportunity[] {
    const opportunities: Opportunity[] = [];

    competitors.forEach(competitor => {
      if (competitor.competitiveStrength === 'low' && competitor.rank <= 10) {
        opportunities.push({
          rank: competitor.rank,
          competitorUrl: competitor.url,
          reason: '競合強度が低く、上位ポジションを狙いやすい',
          actionSuggestion: '同じキーワードでコンテンツを作成し、SEO対策を実施',
          impactScore: 11 - competitor.rank,
        });
      }

      if (competitor.domainAuthority < 30 && competitor.rank <= 15) {
        opportunities.push({
          rank: competitor.rank,
          competitorUrl: competitor.url,
          reason: 'ドメインオーソリティが低く、比較的容易に上位表示可能',
          actionSuggestion: '質の高いコンテンツと適切なSEO施策で上位を目指す',
          impactScore: Math.max(1, 16 - competitor.rank),
        });
      }

      if (competitor.contentType === 'other' && competitor.rank <= 12) {
        opportunities.push({
          rank: competitor.rank,
          competitorUrl: competitor.url,
          reason: '個人プロフィール以外のコンテンツのため、専門性で差別化可能',
          actionSuggestion: '個人の専門性や実績を強調したコンテンツで差別化',
          impactScore: Math.max(1, 13 - competitor.rank),
        });
      }
    });

    return opportunities
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, 5);
  }

  generateRecommendations(
    competitors: CompetitorScore[],
    opportunities: Opportunity[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (opportunities.length > 0) {
      recommendations.push({
        id: `rec-immediate-1`,
        analysisId: '',
        type: 'immediate',
        description: `${opportunities.length}件の即座に取り組める機会があります。特に${opportunities[0].rank}位の競合は強度が低く、狙い目です。`,
        priorityScore: 9,
      });
    }

    const strongCompetitors = competitors.filter(c => c.competitiveStrength === 'high').length;
    if (strongCompetitors > 5) {
      recommendations.push({
        id: `rec-long-term-1`,
        analysisId: '',
        type: 'long_term',
        description: '強い競合が多いため、長期的なコンテンツ戦略が必要です。複合キーワードでの差別化を検討してください。',
        priorityScore: 7,
      });
    }

    const socialCompetitors = competitors.filter(c => c.contentType === 'social').length;
    if (socialCompetitors < 3) {
      recommendations.push({
        id: `rec-medium-term-1`,
        analysisId: '',
        type: 'medium_term',
        description: 'SNSでの露出が少ないため、ソーシャルメディア戦略を強化することで上位表示の可能性があります。',
        priorityScore: 6,
      });
    }

    const averageDA = competitors.reduce((sum, c) => sum + c.domainAuthority, 0) / competitors.length;
    if (averageDA < 40) {
      recommendations.push({
        id: `rec-immediate-2`,
        analysisId: '',
        type: 'immediate',
        description: '全体的にドメインオーソリティが低めです。質の高いコンテンツ作成で上位表示が期待できます。',
        priorityScore: 8,
      });
    }

    return recommendations.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  calculateAnalysisSummary(competitors: CompetitorScore[]): AnalysisSummary {
    const totalCompetitors = competitors.length;
    const strongCompetitors = competitors.filter(c => c.competitiveStrength === 'high').length;
    const opportunities = competitors.filter(c => 
      c.competitiveStrength === 'low' || c.domainAuthority < 30
    ).length;
    const averageDomainAuthority = totalCompetitors > 0 
      ? competitors.reduce((sum, c) => sum + c.domainAuthority, 0) / totalCompetitors 
      : 0;

    return {
      totalCompetitors,
      strongCompetitors,
      opportunities,
      averageDomainAuthority: Math.round(averageDomainAuthority * 100) / 100,
    };
  }

  analyzeCompetitiveStrength(
    searchResults: SearchResult[],
    domainMetrics: DomainMetrics[],
    targetName: string
  ): CompetitorScore[] {
    return searchResults.map((result) => {
      // URLのパースを安全に行う
      let hostname: string;
      try {
        hostname = new URL(result.url).hostname;
      } catch (error) {
        console.warn('Invalid URL format:', result.url);
        // URLが不正な場合はドメインとしてURLをそのまま使用
        hostname = result.url.replace(/^https?:\/\//, '').split('/')[0];
      }

      const domainMetric = domainMetrics.find(dm => 
        result.url.includes(dm.domain) || dm.domain.includes(hostname)
      ) || { domain: hostname, domainAuthority: 25 };

      const contentType = this.classifyContentType(result);
      const competitiveStrength = this.calculateCompetitiveStrength(result, domainMetric, targetName);
      const isTargetPerson = this.isTargetPerson(result, targetName);

      return {
        rank: result.rank,
        url: result.url,
        title: result.title,
        domain: hostname,
        domainAuthority: domainMetric.domainAuthority,
        contentType,
        competitiveStrength,
        isTargetPerson,
      };
    });
  }
}