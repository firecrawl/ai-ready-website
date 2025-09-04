import { NextRequest, NextResponse } from 'next/server';
import FirecrawlApp from '@mendable/firecrawl-js';
import { db } from '@/lib/database';

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY!
});

interface BulkAnalysisRequest {
  url: string;
  maxPages?: number;
  includeSubdomains?: boolean;
  priority?: 'speed' | 'comprehensive';
}

interface PageAnalysis {
  url: string;
  score: number;
  title: string;
  issues: string[];
  recommendations: string[];
  analyzedAt: string;
}

interface BulkAnalysisResult {
  siteUrl: string;
  totalPages: number;
  averageScore: number;
  pageAnalyses: PageAnalysis[];
  topIssues: { issue: string; count: number; pages: string[] }[];
  recommendations: { priority: 'high' | 'medium' | 'low'; title: string; description: string; affectedPages: number }[];
  completedAt: string;
}

// Lightweight analysis function for bulk processing
async function quickAnalyzeHTML(html: string, url: string, metadata: any): Promise<{ score: number; issues: string[]; recommendations: string[] }> {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Quick checks for bulk analysis
  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
  if (h1Count === 0) {
    issues.push('Missing H1 tag');
    recommendations.push('Add a descriptive H1 heading to this page');
    score -= 20;
  } else if (h1Count > 1) {
    issues.push('Multiple H1 tags');
    recommendations.push('Use only one H1 tag per page');
    score -= 10;
  }

  // Check meta description
  const hasMetaDesc = html.includes('name="description"') || html.includes('property="og:description"');
  if (!hasMetaDesc) {
    issues.push('Missing meta description');
    recommendations.push('Add a meta description (70-160 characters)');
    score -= 15;
  }

  // Check for semantic HTML
  const semanticTags = ['<article', '<nav', '<main', '<section', '<header', '<footer'];
  const semanticCount = semanticTags.filter(tag => html.includes(tag)).length;
  if (semanticCount < 2) {
    issues.push('Limited semantic HTML');
    recommendations.push('Use more semantic HTML5 elements (article, nav, main, section)');
    score -= 10;
  }

  // Check structured data
  const hasStructuredData = html.includes('application/ld+json') || html.includes('itemscope');
  if (!hasStructuredData) {
    issues.push('No structured data');
    recommendations.push('Add JSON-LD structured data for better AI understanding');
    score -= 15;
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations
  };
}

export async function POST(request: NextRequest) {
  try {
    const { url, maxPages = 10, includeSubdomains = false, priority = 'speed' }: BulkAnalysisRequest = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    let baseUrl: URL;
    try {
      baseUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    console.log(`[BULK-ANALYSIS] Starting bulk analysis for ${baseUrl.origin}`);
    console.log(`[BULK-ANALYSIS] Settings: maxPages=${maxPages}, includeSubdomains=${includeSubdomains}, priority=${priority}`);

    // Use Firecrawl to crawl the site
    let crawlResult;
    try {
      const crawlOptions: any = {
        limit: Math.min(maxPages, 50), // Cap at 50 for demo
        scrapeOptions: {
          formats: ['html'],
          onlyMainContent: priority === 'speed'
        }
      };

      // Add include/exclude patterns based on subdomain preference
      if (!includeSubdomains) {
        crawlOptions.allowedDomains = [baseUrl.hostname];
      }

      // Start crawl
      const crawlResponse = await firecrawl.crawl(baseUrl.origin, crawlOptions);
      
      console.log(`[BULK-ANALYSIS] Crawl initiated with ID: ${crawlResponse.id || 'N/A'}`);
      
      // For this demo, we'll use the crawl response directly if it contains data
      // In production, you'd typically poll for the crawl status
      crawlResult = crawlResponse;
      
    } catch (crawlError) {
      console.error('Firecrawl crawl error:', crawlError);
      return NextResponse.json({ error: 'Failed to crawl website. Please check the URL and try again.' }, { status: 500 });
    }

    // Process crawled pages
    const pages = crawlResult.data || [];
    console.log(`[BULK-ANALYSIS] Processing ${pages.length} pages`);

    if (pages.length === 0) {
      return NextResponse.json({ error: 'No pages found to analyze' }, { status: 404 });
    }

    const pageAnalyses: PageAnalysis[] = [];
    const allIssues: { [key: string]: { count: number; pages: string[] } } = {};

    // Analyze each page
    for (const page of pages.slice(0, maxPages)) {
      const html = page.html || page.content || '';
      const metadata = page.metadata || {};
      const pageUrl = page.url || url;

      console.log(`[BULK-ANALYSIS] Analyzing page: ${pageUrl}`);

      if (!html) {
        console.warn(`[BULK-ANALYSIS] No HTML content for ${pageUrl}`);
        continue;
      }

      const analysis = await quickAnalyzeHTML(html, pageUrl, metadata);
      
      const pageAnalysis: PageAnalysis = {
        url: pageUrl,
        score: analysis.score,
        title: metadata.title || 'Untitled Page',
        issues: analysis.issues,
        recommendations: analysis.recommendations,
        analyzedAt: new Date().toISOString()
      };

      pageAnalyses.push(pageAnalysis);

      // Aggregate issues
      analysis.issues.forEach(issue => {
        if (!allIssues[issue]) {
          allIssues[issue] = { count: 0, pages: [] };
        }
        allIssues[issue].count++;
        allIssues[issue].pages.push(pageUrl);
      });

      // Save individual page analysis to history
      try {
        await db.saveAnalysis({
          id: `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: pageUrl,
          score: analysis.score,
          checks: analysis.issues.map(issue => ({ id: issue.toLowerCase().replace(/\s+/g, '-'), label: issue, status: 'fail', score: 0, details: issue })),
          metadata: { title: metadata.title, analyzedAt: new Date().toISOString(), isBulkAnalysis: true },
          analyzedAt: new Date().toISOString()
        });
      } catch (saveError) {
        console.warn('Failed to save page analysis to history:', saveError);
      }
    }

    // Calculate overall statistics
    const averageScore = pageAnalyses.length > 0 
      ? Math.round(pageAnalyses.reduce((sum, p) => sum + p.score, 0) / pageAnalyses.length)
      : 0;

    // Get top issues
    const topIssues = Object.entries(allIssues)
      .map(([issue, data]) => ({ issue, count: data.count, pages: data.pages.slice(0, 5) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Generate site-wide recommendations
    const recommendations = [
      {
        priority: 'high' as const,
        title: 'Fix Missing H1 Tags',
        description: 'Add descriptive H1 headings to pages that are missing them for better content structure.',
        affectedPages: allIssues['Missing H1 tag']?.count || 0
      },
      {
        priority: 'high' as const,
        title: 'Add Meta Descriptions',
        description: 'Create unique, compelling meta descriptions (70-160 characters) for better search visibility.',
        affectedPages: allIssues['Missing meta description']?.count || 0
      },
      {
        priority: 'medium' as const,
        title: 'Implement Structured Data',
        description: 'Add JSON-LD structured data to help AI systems better understand your content.',
        affectedPages: allIssues['No structured data']?.count || 0
      },
      {
        priority: 'medium' as const,
        title: 'Improve Semantic HTML',
        description: 'Use more semantic HTML5 elements (article, nav, main, section) for better content meaning.',
        affectedPages: allIssues['Limited semantic HTML']?.count || 0
      }
    ].filter(rec => rec.affectedPages > 0);

    const result: BulkAnalysisResult = {
      siteUrl: baseUrl.origin,
      totalPages: pageAnalyses.length,
      averageScore,
      pageAnalyses: pageAnalyses.sort((a, b) => b.score - a.score), // Sort by score descending
      topIssues,
      recommendations,
      completedAt: new Date().toISOString()
    };

    console.log(`[BULK-ANALYSIS] Completed analysis of ${result.totalPages} pages with average score ${result.averageScore}`);

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Bulk analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk analysis' },
      { status: 500 }
    );
  }
}

// Get status of ongoing bulk analysis
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const siteUrl = searchParams.get('siteUrl');

  if (!siteUrl) {
    return NextResponse.json({ error: 'siteUrl parameter is required' }, { status: 400 });
  }

  try {
    // Get recent analyses for this site
    const recentAnalyses = await db.getAnalysisHistory(siteUrl, 50);
    const bulkAnalyses = recentAnalyses.filter(a => a.metadata?.isBulkAnalysis);

    if (bulkAnalyses.length === 0) {
      return NextResponse.json({
        success: true,
        hasBulkAnalysis: false,
        message: 'No bulk analysis found for this site'
      });
    }

    // Group by analysis date/session
    const latestBulkSession = bulkAnalyses[0].analyzedAt.split('T')[0]; // Get date part
    const sessionAnalyses = bulkAnalyses.filter(a => a.analyzedAt.startsWith(latestBulkSession));

    return NextResponse.json({
      success: true,
      hasBulkAnalysis: true,
      latestSession: {
        date: latestBulkSession,
        totalPages: sessionAnalyses.length,
        averageScore: Math.round(sessionAnalyses.reduce((sum, a) => sum + a.score, 0) / sessionAnalyses.length),
        pages: sessionAnalyses.map(a => ({
          url: a.url,
          score: a.score,
          title: a.metadata?.title || 'Untitled',
          analyzedAt: a.analyzedAt
        }))
      }
    });

  } catch (error) {
    console.error('Bulk analysis status error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve bulk analysis status' },
      { status: 500 }
    );
  }
}