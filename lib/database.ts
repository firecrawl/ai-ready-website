// Simple in-memory database for demonstration
// In production, this would be replaced with a real database like Prisma + PostgreSQL

interface AnalysisResult {
  id: string;
  url: string;
  score: number;
  checks: any[];
  metadata: any;
  analyzedAt: string;
  userId?: string; // For future multi-user support
}

interface CompetitorBenchmark {
  industry: string;
  averageScore: number;
  topSites: { url: string; score: number }[];
  lastUpdated: string;
}

class MemoryDatabase {
  private analyses: AnalysisResult[] = [];
  private benchmarks: CompetitorBenchmark[] = [];

  // Analysis History Methods
  async saveAnalysis(analysis: AnalysisResult): Promise<void> {
    // Remove duplicate URL entries older than the new one
    this.analyses = this.analyses.filter(a => 
      a.url !== analysis.url || a.analyzedAt === analysis.analyzedAt
    );
    this.analyses.push(analysis);
    
    // Keep only last 100 analyses to prevent memory issues
    if (this.analyses.length > 100) {
      this.analyses = this.analyses.slice(-100);
    }
  }

  async getAnalysisHistory(url: string, limit: number = 10): Promise<AnalysisResult[]> {
    return this.analyses
      .filter(a => a.url === url)
      .sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime())
      .slice(0, limit);
  }

  async getLatestAnalysis(url: string): Promise<AnalysisResult | null> {
    const history = await this.getAnalysisHistory(url, 1);
    return history.length > 0 ? history[0] : null;
  }

  // Benchmarking Methods
  async saveBenchmark(benchmark: CompetitorBenchmark): Promise<void> {
    const existingIndex = this.benchmarks.findIndex(b => b.industry === benchmark.industry);
    if (existingIndex >= 0) {
      this.benchmarks[existingIndex] = benchmark;
    } else {
      this.benchmarks.push(benchmark);
    }
  }

  async getBenchmark(industry: string): Promise<CompetitorBenchmark | null> {
    return this.benchmarks.find(b => b.industry === industry) || null;
  }

  async getAllBenchmarks(): Promise<CompetitorBenchmark[]> {
    return [...this.benchmarks];
  }

  // Analytics Methods
  async getScoreTrend(url: string, days: number = 30): Promise<{ date: string; score: number }[]> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return this.analyses
      .filter(a => a.url === url && new Date(a.analyzedAt) >= cutoffDate)
      .sort((a, b) => new Date(a.analyzedAt).getTime() - new Date(b.analyzedAt).getTime())
      .map(a => ({
        date: a.analyzedAt,
        score: a.score
      }));
  }

  async getTopPerformingSites(industry?: string, limit: number = 10): Promise<{ url: string; score: number; analyzedAt: string }[]> {
    let analyses = [...this.analyses];
    
    // If industry filter is provided, we'd need to implement industry detection
    // For now, return top sites overall
    
    // Get latest analysis for each unique URL
    const latestByUrl = new Map<string, AnalysisResult>();
    analyses.forEach(analysis => {
      const existing = latestByUrl.get(analysis.url);
      if (!existing || new Date(analysis.analyzedAt) > new Date(existing.analyzedAt)) {
        latestByUrl.set(analysis.url, analysis);
      }
    });

    return Array.from(latestByUrl.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(a => ({
        url: a.url,
        score: a.score,
        analyzedAt: a.analyzedAt
      }));
  }
}

// Singleton instance
export const db = new MemoryDatabase();

// Industry classification helper
export function classifyIndustry(url: string, title?: string, description?: string): string {
  const domain = url.toLowerCase();
  const content = `${title || ''} ${description || ''}`.toLowerCase();

  // E-commerce indicators
  if (domain.includes('shop') || domain.includes('store') || domain.includes('buy') || 
      content.includes('shop') || content.includes('cart') || content.includes('product')) {
    return 'ecommerce';
  }

  // News/Media indicators  
  if (domain.includes('news') || domain.includes('blog') || domain.includes('media') ||
      content.includes('news') || content.includes('article') || content.includes('breaking')) {
    return 'news-media';
  }

  // Tech/SaaS indicators
  if (domain.includes('api') || domain.includes('dev') || domain.includes('tech') ||
      content.includes('api') || content.includes('developer') || content.includes('software')) {
    return 'tech-saas';
  }

  // Healthcare indicators
  if (domain.includes('health') || domain.includes('medical') || domain.includes('clinic') ||
      content.includes('health') || content.includes('medical') || content.includes('doctor')) {
    return 'healthcare';
  }

  // Education indicators
  if (domain.includes('edu') || domain.includes('learn') || domain.includes('course') ||
      content.includes('education') || content.includes('university') || content.includes('course')) {
    return 'education';
  }

  // Financial services
  if (domain.includes('bank') || domain.includes('finance') || domain.includes('invest') ||
      content.includes('financial') || content.includes('investment') || content.includes('banking')) {
    return 'finance';
  }

  return 'general';
}

// Sample benchmark data for demonstration
export const sampleBenchmarks: CompetitorBenchmark[] = [
  {
    industry: 'tech-saas',
    averageScore: 82,
    topSites: [
      { url: 'docs.stripe.com', score: 97 },
      { url: 'developers.cloudflare.com', score: 94 },
      { url: 'docs.vercel.com', score: 91 },
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    industry: 'ecommerce',
    averageScore: 74,
    topSites: [
      { url: 'shop.tesla.com', score: 89 },
      { url: 'apple.com', score: 87 },
      { url: 'amazon.com', score: 85 },
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    industry: 'news-media',
    averageScore: 79,
    topSites: [
      { url: 'reuters.com', score: 88 },
      { url: 'bbc.com', score: 86 },
      { url: 'nytimes.com', score: 84 },
    ],
    lastUpdated: new Date().toISOString()
  }
];

// Initialize sample benchmarks
sampleBenchmarks.forEach(benchmark => {
  db.saveBenchmark(benchmark);
});