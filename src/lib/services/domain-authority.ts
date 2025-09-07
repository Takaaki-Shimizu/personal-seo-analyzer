import { config } from '@/lib/config';
import { DomainMetrics } from '@/types/analysis';

export class DomainAuthorityService {
  private readonly mozAccessId?: string;
  private readonly mozSecretKey?: string;
  private readonly fallbackEnabled: boolean;

  constructor() {
    this.mozAccessId = config.domainAuthority.mozAccessId;
    this.mozSecretKey = config.domainAuthority.mozSecretKey;
    this.fallbackEnabled = config.domainAuthority.fallbackEnabled;
  }

  async getDomainMetrics(domains: string[]): Promise<DomainMetrics[]> {
    try {
      if (this.mozAccessId && this.mozSecretKey) {
        return await this.getMozMetrics(domains);
      } else if (this.fallbackEnabled) {
        return await this.getFallbackMetrics(domains);
      } else {
        throw new Error('Domain Authority API not configured');
      }
    } catch (error) {
      console.error('Domain Authority API error:', error);
      
      if (this.fallbackEnabled) {
        console.log('Falling back to heuristic domain authority calculation');
        return await this.getFallbackMetrics(domains);
      }
      
      throw error;
    }
  }

  private async getMozMetrics(domains: string[]): Promise<DomainMetrics[]> {
    const url = 'https://lsapi.seomoz.com/v2/url_metrics';
    const targets = domains.map(domain => ({ target: domain }));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${this.mozAccessId}:${this.mozSecretKey}`).toString('base64')}`,
      },
      body: JSON.stringify({
        targets,
        metrics: ['domain_authority', 'page_authority', 'spam_score'],
      }),
    });

    if (!response.ok) {
      throw new Error(`Moz API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.results.map((result: Record<string, unknown>, index: number) => ({
      domain: domains[index],
      domainAuthority: result.domain_authority || 0,
      pageAuthority: result.page_authority || 0,
      spamScore: result.spam_score || 0,
    }));
  }

  private async getFallbackMetrics(domains: string[]): Promise<DomainMetrics[]> {
    return domains.map(domain => {
      const domainAuthority = this.calculateHeuristicDA(domain);
      
      return {
        domain,
        domainAuthority,
        pageAuthority: Math.max(0, domainAuthority - 5),
        spamScore: 0,
      };
    });
  }

  private calculateHeuristicDA(domain: string): number {
    const knownHighAuthority = [
      'wikipedia.org',
      'facebook.com',
      'twitter.com',
      'linkedin.com',
      'instagram.com',
      'youtube.com',
      'github.com',
      'qiita.com',
      'zenn.dev',
      'note.com',
    ];

    const knownMediumAuthority = [
      'wordpress.com',
      'medium.com',
      'hatena',
      'ameblo.jp',
      'yahoo.co.jp',
      'google.com',
    ];

    const knownNewsAuthority = [
      'asahi.com',
      'mainichi.jp',
      'yomiuri.co.jp',
      'sankei.com',
      'nikkei.com',
      'jiji.com',
      'kyodo.co.jp',
    ];

    const domainLower = domain.toLowerCase();

    if (knownHighAuthority.some(auth => domainLower.includes(auth))) {
      return Math.floor(Math.random() * 15) + 85; // 85-100
    }

    if (knownNewsAuthority.some(news => domainLower.includes(news))) {
      return Math.floor(Math.random() * 20) + 75; // 75-95
    }

    if (knownMediumAuthority.some(medium => domainLower.includes(medium))) {
      return Math.floor(Math.random() * 25) + 50; // 50-75
    }

    if (domainLower.includes('.edu') || domainLower.includes('.gov')) {
      return Math.floor(Math.random() * 20) + 70; // 70-90
    }

    if (domainLower.includes('.com') || domainLower.includes('.jp')) {
      return Math.floor(Math.random() * 40) + 20; // 20-60
    }

    return Math.floor(Math.random() * 30) + 10; // 10-40
  }

  async batchGetDomainMetrics(domains: string[], batchSize: number = 10): Promise<DomainMetrics[]> {
    const results: DomainMetrics[] = [];
    
    for (let i = 0; i < domains.length; i += batchSize) {
      const batch = domains.slice(i, i + batchSize);
      const batchResults = await this.getDomainMetrics(batch);
      results.push(...batchResults);
      
      if (i + batchSize < domains.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}