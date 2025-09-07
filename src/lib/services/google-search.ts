import { config } from '@/lib/config';
import { SearchResult, SearchOptions } from '@/types/analysis';

interface GoogleSearchApiResponse {
  items?: Array<{
    title: string;
    link: string;
    snippet?: string;
    displayLink?: string;
  }>;
  searchInformation?: {
    totalResults: string;
  };
}

export class GoogleSearchService {
  private readonly apiKey: string;
  private readonly searchEngineId: string;

  constructor() {
    this.apiKey = config.google.apiKey || 'mock-api-key';
    this.searchEngineId = config.google.searchEngineId || 'mock-search-engine-id';
  }

  async searchCompetitors(name: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { location, count = 10 } = options;
    
    try {
      // APIキーが設定されていない場合やモックの場合はデモデータを返す
      if (!config.google.apiKey || config.google.apiKey.includes('mock')) {
        return this.generateMockSearchResults(name, count);
      }

      const query = this.buildSearchQuery(name, location);
      const response = await this.makeSearchRequest(query, count);
      
      return this.parseSearchResults(response);
    } catch (error) {
      console.error('Google Search API error:', error);
      // API呼び出しに失敗した場合もモックデータを返す
      return this.generateMockSearchResults(name, count);
    }
  }

  private buildSearchQuery(name: string, location?: string): string {
    let query = `"${name}"`;
    
    if (location) {
      query += ` ${location}`;
    }
    
    return query;
  }

  private async makeSearchRequest(query: string, count: number): Promise<GoogleSearchApiResponse> {
    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('cx', this.searchEngineId);
    url.searchParams.set('q', query);
    url.searchParams.set('num', Math.min(count, 10).toString());
    url.searchParams.set('lr', 'lang_ja');
    url.searchParams.set('gl', 'jp');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Google Search API error: ${response.status} - ${errorData.error?.message || response.statusText}`
      );
    }

    return response.json();
  }

  private parseSearchResults(response: GoogleSearchApiResponse): SearchResult[] {
    const items = response.items || [];
    
    return items.map((item, index) => ({
      rank: index + 1,
      url: item.link,
      title: item.title,
      snippet: item.snippet,
      displayUrl: item.displayLink,
    }));
  }

  private generateMockSearchResults(name: string, count: number): SearchResult[] {
    const mockResults: SearchResult[] = [
      {
        rank: 1,
        url: 'https://linkedin.com/in/' + name.toLowerCase().replace(/\s+/g, '-'),
        title: `${name} - LinkedIn プロフィール`,
        snippet: `${name}のプロフィールをLinkedInで表示。経歴、学歴、つながりを確認できます。`,
        displayUrl: 'linkedin.com',
      },
      {
        rank: 2,
        url: 'https://twitter.com/' + name.toLowerCase().replace(/\s+/g, '_'),
        title: `${name} (@${name.toLowerCase().replace(/\s+/g, '_')}) / X`,
        snippet: `${name}の最新ツイートをチェック。`,
        displayUrl: 'twitter.com',
      },
      {
        rank: 3,
        url: 'https://example-company.com/team/' + name.toLowerCase().replace(/\s+/g, '-'),
        title: `${name} - チームメンバー | Example Company`,
        snippet: `Example Companyのチームメンバー${name}についてご紹介します。`,
        displayUrl: 'example-company.com',
      },
      {
        rank: 4,
        url: 'https://facebook.com/' + name.toLowerCase().replace(/\s+/g, '.'),
        title: `${name} | Facebook`,
        snippet: `${name}さんのFacebookプロフィール。`,
        displayUrl: 'facebook.com',
      },
      {
        rank: 5,
        url: 'https://qiita.com/' + name.toLowerCase().replace(/\s+/g, '_'),
        title: `${name} - Qiita`,
        snippet: `${name}が投稿した記事一覧です。プログラミングに関する知見を共有しています。`,
        displayUrl: 'qiita.com',
      },
      {
        rank: 6,
        url: 'https://note.com/' + name.toLowerCase().replace(/\s+/g, '_'),
        title: `${name}｜note`,
        snippet: `${name}です。日々の気づきや学びを記録しています。`,
        displayUrl: 'note.com',
      },
      {
        rank: 7,
        url: 'https://github.com/' + name.toLowerCase().replace(/\s+/g, '-'),
        title: `${name} - GitHub`,
        snippet: `${name}のGitHubプロフィール。オープンソースプロジェクトへの貢献が確認できます。`,
        displayUrl: 'github.com',
      },
      {
        rank: 8,
        url: 'https://example-blog.com/author/' + name.toLowerCase().replace(/\s+/g, '-'),
        title: `${name}の記事一覧 | Tech Blog`,
        snippet: `${name}が執筆した技術記事の一覧ページです。`,
        displayUrl: 'example-blog.com',
      },
      {
        rank: 9,
        url: 'https://youtube.com/@' + name.toLowerCase().replace(/\s+/g, ''),
        title: `${name} - YouTube`,
        snippet: `${name}のYouTubeチャンネル。技術解説動画を配信中。`,
        displayUrl: 'youtube.com',
      },
      {
        rank: 10,
        url: 'https://example-university.ac.jp/staff/' + name.toLowerCase().replace(/\s+/g, '-'),
        title: `${name} | Example University`,
        snippet: `Example University所属の${name}の研究者プロフィール。`,
        displayUrl: 'example-university.ac.jp',
      },
    ];

    return mockResults.slice(0, Math.min(count, mockResults.length));
  }

  async checkApiQuota(): Promise<boolean> {
    try {
      if (!config.google.apiKey || config.google.apiKey.includes('mock')) {
        return true; // モック環境では常にtrueを返す
      }
      await this.makeSearchRequest('test', 1);
      return true;
    } catch {
      return false;
    }
  }
}