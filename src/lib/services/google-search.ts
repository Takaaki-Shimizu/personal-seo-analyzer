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
    this.apiKey = config.google.apiKey;
    this.searchEngineId = config.google.searchEngineId;
  }

  async searchCompetitors(name: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { location, count = 10 } = options;
    
    try {
      const query = this.buildSearchQuery(name, location);
      const response = await this.makeSearchRequest(query, count);
      
      return this.parseSearchResults(response);
    } catch (error) {
      console.error('Google Search API error:', error);
      throw new Error('検索の実行に失敗しました');
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

  async checkApiQuota(): Promise<boolean> {
    try {
      await this.makeSearchRequest('test', 1);
      return true;
    } catch {
      return false;
    }
  }
}