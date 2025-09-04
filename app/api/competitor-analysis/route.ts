import { NextRequest, NextResponse } from 'next/server';
import FirecrawlApp from '@mendable/firecrawl-js';

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY!
});

interface CompetitorData {
  url: string;
  domain: string;
  seoScore: number;
  keywordCount: number;
  contentLength: number;
  loadTime: number; // estimated
  mobileOptimized: boolean;
  hasSSL: boolean;
  domainAuthority: number;
  topKeywords: string[];
  technicalIssues: number;
}

interface CompetitorComparison {
  primarySite: CompetitorData;
  competitors: CompetitorData[];
  insights: {
    ranking: number; // Position among analyzed sites
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  gapAnalysis: {
    missingKeywords: string[];
    contentGaps: string[];
    technicalImprovements: string[];
  };
}

// Analyze a single competitor
async function analyzeCompetitor(url: string): Promise<CompetitorData> {
  try {
    // Scrape the competitor website
    const scrapeResult = await firecrawl.scrape(url, {
      formats: ['html'],
    });
    
    const html = scrapeResult?.html || scrapeResult?.data?.html || scrapeResult?.content || '';
    const metadata = scrapeResult?.metadata || scrapeResult?.data?.metadata || {};
    
    if (!html) {
      throw new Error('Failed to scrape competitor site');
    }
    
    const domain = new URL(url).hostname;
    
    // Extract content for analysis
    const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                          .replace(/<[^>]+>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim();
    
    const words = textContent.split(' ').filter(w => w.length > 2);
    const contentLength = words.length;
    
    // Technical analysis
    const hasSSL = url.startsWith('https://');
    const hasViewport = html.includes('name="viewport"');
    const hasResponsive = html.includes('media=') || html.includes('@media');
    const mobileOptimized = hasViewport && hasResponsive;
    
    // Count technical issues
    let technicalIssues = 0;
    if (!hasSSL) technicalIssues++;
    if (!mobileOptimized) technicalIssues++;
    if (!html.includes('<meta name="description"')) technicalIssues++;
    if (!html.match(/<h1[^>]*>/i)) technicalIssues++;
    
    // Keyword extraction (simplified)
    const keywordCounts: Record<string, number> = {};
    const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out'];
    
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.length > 3 && !stopWords.includes(cleanWord)) {
        keywordCounts[cleanWord] = (keywordCounts[cleanWord] || 0) + 1;
      }
    });
    
    const topKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
    
    // Estimate SEO score based on various factors
    let seoScore = 50; // Base score
    if (hasSSL) seoScore += 10;
    if (mobileOptimized) seoScore += 15;
    if (metadata.title) seoScore += 10;
    if (metadata.description) seoScore += 10;
    if (contentLength > 1000) seoScore += 10;
    seoScore -= technicalIssues * 5;
    seoScore = Math.max(0, Math.min(100, seoScore));
    
    // Estimate domain authority (simplified)
    let domainAuthority = 20;
    if (domain.length <= 10) domainAuthority += 15;
    if (['.com', '.org', '.net'].some(tld => domain.endsWith(tld))) domainAuthority += 10;
    if (html.includes('google-analytics') || html.includes('gtag')) domainAuthority += 20;
    if (html.includes('facebook') || html.includes('twitter')) domainAuthority += 10;
    domainAuthority = Math.min(100, domainAuthority);
    
    // Estimate load time (very rough approximation based on content size)
    const loadTime = Math.min(5000, 500 + (html.length / 1000));
    
    return {
      url,
      domain,
      seoScore,
      keywordCount: Object.keys(keywordCounts).length,
      contentLength,
      loadTime: Math.round(loadTime),
      mobileOptimized,
      hasSSL,
      domainAuthority,
      topKeywords,
      technicalIssues
    };
    
  } catch (error) {
    console.error(`Failed to analyze competitor ${url}:`, error);
    // Return default data for failed analysis
    const domain = new URL(url).hostname;
    return {
      url,
      domain,
      seoScore: 0,
      keywordCount: 0,
      contentLength: 0,
      loadTime: 0,
      mobileOptimized: false,
      hasSSL: url.startsWith('https://'),
      domainAuthority: 0,
      topKeywords: [],
      technicalIssues: 10
    };
  }
}

// Generate competitive insights
function generateInsights(primarySite: CompetitorData, competitors: CompetitorData[]): CompetitorComparison['insights'] {
  const allSites = [primarySite, ...competitors].sort((a, b) => b.seoScore - a.seoScore);
  const ranking = allSites.findIndex(site => site.url === primarySite.url) + 1;
  
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];
  
  // Analyze strengths
  if (primarySite.seoScore > 80) strengths.push('Excellent overall SEO performance');
  if (primarySite.hasSSL && !competitors.every(c => c.hasSSL)) strengths.push('Strong security implementation');
  if (primarySite.mobileOptimized && !competitors.every(c => c.mobileOptimized)) strengths.push('Good mobile optimization');
  if (primarySite.contentLength > competitors.reduce((avg, c) => avg + c.contentLength, 0) / competitors.length) {
    strengths.push('Above-average content depth');
  }
  
  // Analyze weaknesses
  if (primarySite.seoScore < 60) weaknesses.push('SEO score below industry standards');
  if (!primarySite.hasSSL) weaknesses.push('Missing SSL certificate');
  if (!primarySite.mobileOptimized) weaknesses.push('Poor mobile optimization');
  if (primarySite.technicalIssues > 3) weaknesses.push('Multiple technical SEO issues');
  
  // Identify opportunities
  const avgContentLength = competitors.reduce((avg, c) => avg + c.contentLength, 0) / competitors.length;
  if (primarySite.contentLength < avgContentLength * 0.8) {
    opportunities.push('Opportunity to expand content depth');
  }
  
  const avgKeywords = competitors.reduce((avg, c) => avg + c.keywordCount, 0) / competitors.length;
  if (primarySite.keywordCount < avgKeywords * 0.8) {
    opportunities.push('Keyword optimization potential');
  }
  
  // Identify threats
  const topCompetitors = competitors.filter(c => c.seoScore > primarySite.seoScore);
  if (topCompetitors.length > 0) {
    threats.push(`${topCompetitors.length} competitors outperforming in SEO`);
  }
  
  const highAuthorityCompetitors = competitors.filter(c => c.domainAuthority > primarySite.domainAuthority);
  if (highAuthorityCompetitors.length > 0) {
    threats.push('Competitors with stronger domain authority');
  }
  
  return { ranking, strengths, weaknesses, opportunities, threats };
}

// Generate gap analysis
function generateGapAnalysis(primarySite: CompetitorData, competitors: CompetitorData[]): CompetitorComparison['gapAnalysis'] {
  // Find missing keywords (keywords competitors have that primary site doesn't)
  const primaryKeywords = new Set(primarySite.topKeywords);
  const competitorKeywords = new Set(competitors.flatMap(c => c.topKeywords));
  const missingKeywords = Array.from(competitorKeywords).filter(k => !primaryKeywords.has(k)).slice(0, 10);
  
  // Content gaps
  const contentGaps: string[] = [];
  const avgContentLength = competitors.reduce((avg, c) => avg + c.contentLength, 0) / competitors.length;
  if (primarySite.contentLength < avgContentLength * 0.7) {
    contentGaps.push('Significantly shorter content than competitors');
  }
  if (primarySite.keywordCount < avgContentLength * 0.8) {
    contentGaps.push('Lower keyword diversity compared to competitors');
  }
  
  // Technical improvements
  const technicalImprovements: string[] = [];
  if (!primarySite.hasSSL) technicalImprovements.push('Implement SSL certificate');
  if (!primarySite.mobileOptimized) technicalImprovements.push('Improve mobile responsiveness');
  if (primarySite.loadTime > 3000) technicalImprovements.push('Optimize page loading speed');
  if (primarySite.technicalIssues > 2) technicalImprovements.push('Fix technical SEO issues');
  
  return { missingKeywords, contentGaps, technicalImprovements };
}

export async function POST(request: NextRequest) {
  try {
    const { primaryUrl, competitorUrls } = await request.json();
    
    if (!primaryUrl || !Array.isArray(competitorUrls)) {
      return NextResponse.json({ 
        error: 'Primary URL and competitor URLs array are required' 
      }, { status: 400 });
    }
    
    console.log('[COMPETITOR-ANALYSIS] Starting analysis for:', primaryUrl);
    console.log('[COMPETITOR-ANALYSIS] Analyzing competitors:', competitorUrls);
    
    const analysisStartTime = Date.now();
    
    // Analyze primary site and competitors in parallel
    const [primarySite, ...competitors] = await Promise.all([
      analyzeCompetitor(primaryUrl),
      ...competitorUrls.map((url: string) => analyzeCompetitor(url))
    ]);
    
    // Generate insights and gap analysis
    const insights = generateInsights(primarySite, competitors);
    const gapAnalysis = generateGapAnalysis(primarySite, competitors);
    
    const result: CompetitorComparison = {
      primarySite,
      competitors,
      insights,
      gapAnalysis
    };
    
    console.log(`[COMPETITOR-ANALYSIS] Analysis completed in ${Date.now() - analysisStartTime}ms`);
    console.log(`[COMPETITOR-ANALYSIS] Primary site ranking: ${insights.ranking}/${competitors.length + 1}`);
    
    return NextResponse.json({
      success: true,
      ...result,
      analyzedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Competitor analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to perform competitor analysis' },
      { status: 500 }
    );
  }
}