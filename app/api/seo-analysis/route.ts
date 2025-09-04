import { NextRequest, NextResponse } from 'next/server';
import FirecrawlApp from '@mendable/firecrawl-js';

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY!
});

interface SEOResult {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warning';
  score: number;
  details: string;
  recommendation: string;
  category: 'keywords' | 'technical' | 'content' | 'backlinks' | 'competition';
}

interface KeywordAnalysis {
  keyword: string;
  density: number;
  frequency: number;
  prominence: number; // Based on position in title, headings, etc.
  relevance: 'high' | 'medium' | 'low';
}

interface CompetitorInsight {
  domain: string;
  estimatedAuthority: number;
  commonKeywords: string[];
  contentLength: number;
}

// Extract keywords from text content
function extractKeywords(text: string, title: string = '', headings: string[] = []): KeywordAnalysis[] {
  // Clean and normalize text
  const cleanText = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = cleanText.split(' ').filter(word => 
    word.length > 2 && 
    !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'may', 'she', 'use', 'her', 'here', 'what', 'your', 'when', 'will', 'each', 'which', 'their', 'time', 'this', 'that', 'into', 'said', 'made', 'have', 'been', 'they', 'were', 'there', 'would', 'other', 'after', 'first', 'about', 'right', 'where', 'could', 'every', 'still', 'should', 'these', 'those', 'years', 'through', 'before', 'against', 'because', 'without', 'between'].includes(word)
  );
  
  // Count word frequencies
  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate densities and prominence
  const totalWords = words.length;
  const titleLower = title.toLowerCase();
  const headingsLower = headings.map(h => h.toLowerCase()).join(' ');
  
  const keywords: KeywordAnalysis[] = Object.entries(wordCount)
    .map(([keyword, frequency]) => {
      const density = (frequency / totalWords) * 100;
      
      // Calculate prominence based on position in important elements
      let prominence = 0;
      if (titleLower.includes(keyword)) prominence += 10;
      if (headingsLower.includes(keyword)) prominence += 5;
      
      // Determine relevance based on frequency and prominence
      let relevance: 'high' | 'medium' | 'low' = 'low';
      if (frequency >= 5 && prominence >= 5) relevance = 'high';
      else if (frequency >= 3 || prominence >= 3) relevance = 'medium';
      
      return {
        keyword,
        density,
        frequency,
        prominence,
        relevance
      };
    })
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20); // Top 20 keywords
  
  return keywords;
}

// Analyze technical SEO aspects
async function analyzeTechnicalSEO(html: string, url: string): Promise<SEOResult[]> {
  const results: SEOResult[] = [];
  const domain = new URL(url).hostname;
  
  // Check Core Web Vitals indicators
  const hasLazyLoading = html.includes('loading="lazy"') || html.includes('data-lazy');
  const hasWebPImages = html.includes('.webp') || html.includes('format=webp');
  const hasCriticalCSS = html.includes('<style>') && html.includes('critical');
  const hasAsyncScripts = html.includes('async') || html.includes('defer');
  
  let coreWebVitalsScore = 0;
  const cwvDetails: string[] = [];
  
  if (hasLazyLoading) { coreWebVitalsScore += 25; cwvDetails.push('Lazy loading ✓'); }
  if (hasWebPImages) { coreWebVitalsScore += 25; cwvDetails.push('Modern image formats ✓'); }
  if (hasCriticalCSS) { coreWebVitalsScore += 25; cwvDetails.push('Critical CSS ✓'); }
  if (hasAsyncScripts) { coreWebVitalsScore += 25; cwvDetails.push('Async scripts ✓'); }
  
  results.push({
    id: 'core-web-vitals',
    label: 'Core Web Vitals Optimization',
    status: coreWebVitalsScore >= 75 ? 'pass' : coreWebVitalsScore >= 50 ? 'warning' : 'fail',
    score: coreWebVitalsScore,
    details: cwvDetails.length > 0 ? cwvDetails.join(', ') : 'No performance optimizations detected',
    recommendation: coreWebVitalsScore < 75 ? 'Implement lazy loading, use WebP images, optimize critical CSS and async scripts' : 'Great performance optimization!',
    category: 'technical'
  });
  
  // Mobile-friendliness check
  const hasViewport = html.includes('name="viewport"');
  const hasResponsiveCSS = html.includes('media=') || html.includes('@media') || html.includes('responsive');
  const hasTouchIcons = html.includes('apple-touch-icon') || html.includes('manifest.json');
  
  let mobileScore = 20; // Base score
  if (hasViewport) mobileScore += 40;
  if (hasResponsiveCSS) mobileScore += 30;
  if (hasTouchIcons) mobileScore += 10;
  
  results.push({
    id: 'mobile-friendly',
    label: 'Mobile Friendliness',
    status: mobileScore >= 80 ? 'pass' : mobileScore >= 60 ? 'warning' : 'fail',
    score: mobileScore,
    details: `Viewport meta: ${hasViewport ? 'Yes' : 'No'}, Responsive CSS: ${hasResponsiveCSS ? 'Yes' : 'No'}`,
    recommendation: mobileScore < 80 ? 'Add viewport meta tag and implement responsive design' : 'Mobile optimization looks good',
    category: 'technical'
  });
  
  // SSL and Security check
  const isHTTPS = url.startsWith('https://');
  const hasHSTS = html.includes('Strict-Transport-Security');
  const hasCSP = html.includes('Content-Security-Policy');
  
  let securityScore = isHTTPS ? 60 : 0;
  if (hasHSTS) securityScore += 20;
  if (hasCSP) securityScore += 20;
  
  results.push({
    id: 'security',
    label: 'Security & SSL',
    status: securityScore >= 80 ? 'pass' : securityScore >= 40 ? 'warning' : 'fail',
    score: securityScore,
    details: `HTTPS: ${isHTTPS ? 'Yes' : 'No'}, HSTS: ${hasHSTS ? 'Yes' : 'No'}, CSP: ${hasCSP ? 'Yes' : 'No'}`,
    recommendation: securityScore < 80 ? 'Implement HTTPS, HSTS headers, and Content Security Policy' : 'Strong security implementation',
    category: 'technical'
  });
  
  return results;
}

// Estimate domain authority and backlink metrics
function estimateDomainAuthority(domain: string, html: string): SEOResult {
  // Simple domain authority estimation based on various factors
  let authorityScore = 0;
  
  // Domain age estimation (very rough)
  const isOldDomain = domain.length <= 10; // Shorter domains often older
  const hasPremiumTLD = ['.com', '.org', '.net'].some(tld => domain.endsWith(tld));
  
  // Technical indicators of authority
  const hasSSL = true; // We already checked this
  const hasGoogleAnalytics = html.includes('google-analytics') || html.includes('gtag') || html.includes('ga(');
  const hasGTM = html.includes('googletagmanager');
  const hasFacebook = html.includes('facebook') || html.includes('fb-');
  const hasTwitter = html.includes('twitter') || html.includes('tweet');
  const hasLinkedIn = html.includes('linkedin');
  
  // Social proof indicators
  const socialCount = [hasGoogleAnalytics, hasGTM, hasFacebook, hasTwitter, hasLinkedIn].filter(Boolean).length;
  
  // Estimate authority
  if (isOldDomain) authorityScore += 20;
  if (hasPremiumTLD) authorityScore += 15;
  if (hasGoogleAnalytics) authorityScore += 20;
  if (hasGTM) authorityScore += 10;
  authorityScore += socialCount * 7; // Social presence bonus
  
  // Known high-authority domains boost
  const highAuthDomains = ['github.com', 'stackoverflow.com', 'wikipedia.org', 'medium.com', 'linkedin.com'];
  if (highAuthDomains.some(d => domain.includes(d))) {
    authorityScore = Math.max(authorityScore, 85);
  }
  
  authorityScore = Math.min(100, authorityScore);
  
  return {
    id: 'domain-authority',
    label: 'Domain Authority Estimate',
    status: authorityScore >= 70 ? 'pass' : authorityScore >= 40 ? 'warning' : 'fail',
    score: authorityScore,
    details: `Estimated DA: ${authorityScore}/100 based on technical and social indicators`,
    recommendation: authorityScore < 70 ? 'Focus on building quality backlinks and improving social presence' : 'Strong domain authority indicators',
    category: 'backlinks'
  };
}

// Analyze content quality and SEO
function analyzeContentSEO(html: string, keywords: KeywordAnalysis[]): SEOResult[] {
  const results: SEOResult[] = [];
  
  // Content length analysis
  const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent.split(' ').length;
  
  let contentLengthScore = 0;
  if (wordCount >= 2000) contentLengthScore = 100;
  else if (wordCount >= 1000) contentLengthScore = 85;
  else if (wordCount >= 500) contentLengthScore = 70;
  else if (wordCount >= 300) contentLengthScore = 50;
  else contentLengthScore = 25;
  
  results.push({
    id: 'content-length',
    label: 'Content Length',
    status: contentLengthScore >= 70 ? 'pass' : contentLengthScore >= 50 ? 'warning' : 'fail',
    score: contentLengthScore,
    details: `${wordCount} words - ${wordCount >= 1000 ? 'Comprehensive' : wordCount >= 500 ? 'Good' : 'Short'} content`,
    recommendation: contentLengthScore < 70 ? 'Consider adding more comprehensive, valuable content (aim for 1000+ words)' : 'Great content depth',
    category: 'content'
  });
  
  // Keyword optimization analysis
  const primaryKeywords = keywords.filter(k => k.relevance === 'high').slice(0, 3);
  const keywordOptimizationScore = primaryKeywords.length * 33.33;
  
  results.push({
    id: 'keyword-optimization',
    label: 'Keyword Optimization',
    status: keywordOptimizationScore >= 66 ? 'pass' : keywordOptimizationScore >= 33 ? 'warning' : 'fail',
    score: Math.round(keywordOptimizationScore),
    details: `${primaryKeywords.length} high-relevance keywords identified: ${primaryKeywords.map(k => k.keyword).join(', ')}`,
    recommendation: keywordOptimizationScore < 66 ? 'Focus on 2-3 primary keywords and use them naturally in titles and headings' : 'Well-optimized keyword usage',
    category: 'keywords'
  });
  
  // Internal linking analysis
  const internalLinks = (html.match(/<a[^>]*href="(?!http)[^"]*"/g) || []).length;
  const externalLinks = (html.match(/<a[^>]*href="http[^"]*"/g) || []).length;
  const totalLinks = internalLinks + externalLinks;
  
  let linkingScore = 0;
  if (internalLinks >= 5) linkingScore += 50;
  else if (internalLinks >= 2) linkingScore += 30;
  
  if (externalLinks >= 2 && externalLinks <= 10) linkingScore += 30;
  else if (externalLinks >= 1) linkingScore += 20;
  
  if (totalLinks > 0) linkingScore += 20;
  
  results.push({
    id: 'internal-linking',
    label: 'Internal Linking',
    status: linkingScore >= 70 ? 'pass' : linkingScore >= 40 ? 'warning' : 'fail',
    score: linkingScore,
    details: `${internalLinks} internal links, ${externalLinks} external links`,
    recommendation: linkingScore < 70 ? 'Add more internal links to related content and include relevant external references' : 'Good linking structure',
    category: 'content'
  });
  
  return results;
}

// Generate competitive insights (simplified)
function generateCompetitiveInsights(keywords: KeywordAnalysis[], domain: string): SEOResult {
  // This is a simplified competitive analysis
  // In a real implementation, you'd query competitor APIs or databases
  
  const topKeywords = keywords.filter(k => k.relevance === 'high').slice(0, 5);
  const competitiveStrength = topKeywords.length * 20;
  
  // Estimate based on domain characteristics
  const domainFactors = {
    hasSubdomain: domain.includes('.') && domain.split('.').length > 2,
    isShort: domain.length <= 12,
    hasBrandName: topKeywords.some(k => domain.includes(k.keyword))
  };
  
  const brandingScore = Object.values(domainFactors).filter(Boolean).length * 10;
  const totalScore = Math.min(100, competitiveStrength + brandingScore);
  
  return {
    id: 'competitive-analysis',
    label: 'Competitive Position',
    status: totalScore >= 70 ? 'pass' : totalScore >= 50 ? 'warning' : 'fail',
    score: totalScore,
    details: `${topKeywords.length} competitive keywords identified with strong brand alignment`,
    recommendation: totalScore < 70 ? 'Focus on building unique keyword positions and brand recognition' : 'Strong competitive positioning',
    category: 'competition'
  };
}

export async function POST(request: NextRequest) {
  try {
    let { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    console.log('[SEO-ANALYSIS] Starting comprehensive SEO analysis for:', url);
    const analysisStartTime = Date.now();
    
    // Scrape the website
    let scrapeResult;
    try {
      scrapeResult = await firecrawl.scrape(url, {
        formats: ['html'],
      });
    } catch (scrapeError) {
      console.error('Firecrawl scrape error:', scrapeError);
      return NextResponse.json({ error: 'Failed to scrape website for SEO analysis' }, { status: 500 });
    }
    
    const html = scrapeResult?.html || scrapeResult?.data?.html || scrapeResult?.content || '';
    const metadata = scrapeResult?.metadata || scrapeResult?.data?.metadata || {};
    
    if (!html) {
      return NextResponse.json({ error: 'Failed to extract content for SEO analysis' }, { status: 500 });
    }
    
    const domain = new URL(url).hostname;
    
    // Extract text content and structure
    const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                          .replace(/<[^>]+>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim();
    
    const title = metadata.title || html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || '';
    const headings = (html.match(/<h[1-6][^>]*>([^<]*)<\/h[1-6]>/gi) || [])
                    .map(h => h.replace(/<[^>]+>/g, '').trim());
    
    console.log('[SEO-ANALYSIS] Analyzing keywords and content...');
    
    // Perform keyword analysis
    const keywords = extractKeywords(textContent, title, headings);
    
    console.log('[SEO-ANALYSIS] Running technical SEO analysis...');
    
    // Perform various SEO analyses
    const technicalResults = await analyzeTechnicalSEO(html, url);
    const contentResults = analyzeContentSEO(html, keywords);
    const domainAuthorityResult = estimateDomainAuthority(domain, html);
    const competitiveResult = generateCompetitiveInsights(keywords, domain);
    
    // Combine all results
    const allResults = [
      ...technicalResults,
      ...contentResults,
      domainAuthorityResult,
      competitiveResult
    ];
    
    // Calculate category scores
    const categoryScores = {
      technical: technicalResults.reduce((sum, r) => sum + r.score, 0) / technicalResults.length,
      content: contentResults.reduce((sum, r) => sum + r.score, 0) / contentResults.length,
      keywords: contentResults.filter(r => r.category === 'keywords').reduce((sum, r) => sum + r.score, 0) / Math.max(1, contentResults.filter(r => r.category === 'keywords').length),
      backlinks: domainAuthorityResult.score,
      competition: competitiveResult.score
    };
    
    // Calculate overall SEO score
    const weights = {
      technical: 0.25,
      content: 0.25,
      keywords: 0.20,
      backlinks: 0.15,
      competition: 0.15
    };
    
    const overallSEOScore = Math.round(
      Object.entries(categoryScores).reduce((sum, [category, score]) => {
        return sum + (score * weights[category as keyof typeof weights]);
      }, 0)
    );
    
    console.log(`[SEO-ANALYSIS] Analysis completed in ${Date.now() - analysisStartTime}ms`);
    console.log(`[SEO-ANALYSIS] Overall SEO score: ${overallSEOScore}/100`);
    
    return NextResponse.json({
      success: true,
      url,
      domain,
      overallSEOScore,
      categoryScores,
      seoResults: allResults,
      keywordAnalysis: {
        topKeywords: keywords.slice(0, 10),
        totalKeywords: keywords.length,
        primaryKeywords: keywords.filter(k => k.relevance === 'high'),
        keywordDensity: keywords.reduce((sum, k) => sum + k.density, 0)
      },
      contentMetrics: {
        wordCount: textContent.split(' ').length,
        readingTime: Math.ceil(textContent.split(' ').length / 200), // Assume 200 WPM
        headingCount: headings.length,
        internalLinks: (html.match(/<a[^>]*href="(?!http)[^"]*"/g) || []).length,
        externalLinks: (html.match(/<a[^>]*href="http[^"]*"/g) || []).length,
        imageCount: (html.match(/<img/g) || []).length
      },
      metadata: {
        title,
        description: metadata.description,
        analyzedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('SEO analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to perform SEO analysis' },
      { status: 500 }
    );
  }
}