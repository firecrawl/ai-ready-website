import { NextRequest, NextResponse } from 'next/server';
import FirecrawlApp from '@mendable/firecrawl-js';

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY!
});

// Enhanced platform detection
function detectPlatformType(url: string, html?: string): 'shopify' | 'wordpress' | 'generic' {
  const urlLower = url.toLowerCase();
  const htmlLower = html?.toLowerCase() || '';
  
  // Shopify detection patterns
  if (urlLower.includes('shopify.com') || 
      urlLower.includes('.myshopify.com') ||
      htmlLower.includes('shopify') ||
      htmlLower.includes('shop-js') ||
      htmlLower.includes('/shop/js/') ||
      htmlLower.includes('shopify-features') ||
      htmlLower.includes('shopify-analytics-lib')) {
    return 'shopify';
  }
  
  // WordPress detection patterns  
  if (htmlLower.includes('wp-content') ||
      htmlLower.includes('wordpress') ||
      htmlLower.includes('/wp-includes/') ||
      htmlLower.includes('wp-json')) {
    return 'wordpress';
  }
  
  return 'generic';
}

function getLlmsPaths(platformType: 'shopify' | 'wordpress' | 'generic'): string[] {
  const basePaths = [
    'llms.txt',
    'LLMs.txt', 
    'llms-full.txt',
    '.well-known/llms.txt',
    'public/llms.txt'
  ];

  switch (platformType) {
    case 'shopify':
      return [
        ...basePaths,
        'files/llms.txt',
        'assets/llms.txt', 
        'pages/llms.txt',
        'apps/llms.txt',
        'cdn/shop/files/llms.txt',
        'cdn/files/llms.txt',
        's/files/llms.txt',
        'collections/llms.txt',
        'blogs/llms.txt'
      ];
    
    case 'wordpress':
      return [
        ...basePaths,
        'wp-content/uploads/llms.txt',
        'wp-content/llms.txt',
        'uploads/llms.txt',
        'media/llms.txt',
        'content/llms.txt'
      ];
      
    default:
      return [
        ...basePaths,
        'static/llms.txt',
        'docs/llms.txt',
        'documentation/llms.txt',
        'api/llms.txt',
        '_next/static/llms.txt',
        'dist/llms.txt'
      ];
  }
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
    
    const baseUrl = new URL(url).origin;
    
    // Enhanced LLMs.txt discovery with platform detection
    const results: any = {
      url: baseUrl,
      checks: [],
      platformType: 'generic',
      pathsChecked: []
    };
    
    try {
      // First get basic HTML to detect platform
      const htmlResponse = await fetch(baseUrl);
      const html = htmlResponse.ok ? await htmlResponse.text() : '';
      const platformType = detectPlatformType(baseUrl, html);
      const llmsPaths = getLlmsPaths(platformType);
      
      results.platformType = platformType;
      results.pathsChecked = llmsPaths;
      
      // Test each path
      for (const path of llmsPaths) {
        const testUrl = `${baseUrl}/${path}`;
        
        try {
          const response = await fetch(testUrl);
          const text = await response.text();
          
          // Enhanced validation for LLMs.txt files
          const isValidLlms = (
            text.length > 10 && // Has some content
            !text.includes('<!DOCTYPE') && 
            !text.includes('<html') &&
            !text.includes('<HTML') &&
            !text.toLowerCase().includes('404 not found') &&
            !text.toLowerCase().includes('page not found') &&
            !text.toLowerCase().includes('cannot be found') &&
            !text.toLowerCase().includes('<title>404') &&
            !text.includes('<body') && // Not an HTML page
            // Additional content validation
            (text.includes('http') || 
             text.includes('AI') || 
             text.includes('LLM') ||
             text.includes('model') ||
             text.includes('crawl') ||
             text.includes('#') || // Markdown-style comments
             text.includes('//') || // Comments
             text.match(/^[^\s<>]+:/m)) // Looks like structured data
          );
          
          results.checks.push({
            path,
            fetchStatus: response.status,
            fetchOk: response.ok,
            contentLength: text.length,
            isHTML: text.includes('<!DOCTYPE') || text.includes('<html'),
            has404: text.includes('404') || text.includes('Not Found'),
            isValidLlms,
            hasLLMContent: (
              text.toLowerCase().includes('llm') || 
              text.toLowerCase().includes('ai') ||
              text.toLowerCase().includes('documentation') ||
              text.toLowerCase().includes('api') ||
              text.includes('#') ||
              text.includes('http')
            ),
            first100Chars: text.substring(0, 100)
          });
          
          // If we found a valid one, we can break early for efficiency
          if (isValidLlms) {
            results.foundValidLlms = {
              path,
              content: text.substring(0, 500) // First 500 chars for preview
            };
            break;
          }
        } catch (e: any) {
          results.checks.push({
            path,
            error: e.message
          });
        }
      }
    } catch (e: any) {
      results.error = `Platform detection failed: ${e.message}`;
    }
    
    // Also try with Firecrawl to see what it finds (for comparison)
    try {
      const scrapeResult = await firecrawl.scrape(`${baseUrl}/llms.txt`, {
        formats: ['markdown'],
      });
      
      results.firecrawlResult = {
        success: true,
        hasContent: !!scrapeResult?.markdown,
        contentLength: scrapeResult?.markdown?.length || 0,
        first100Chars: scrapeResult?.markdown?.substring(0, 100)
      };
    } catch (e: any) {
      results.firecrawlResult = {
        success: false,
        error: e.message
      };
    }
    
    return NextResponse.json(results);
    
  } catch (error: any) {
    console.error('Check LLMs error:', error);
    return NextResponse.json(
      { error: 'Failed to check LLMs.txt: ' + error.message },
      { status: 500 }
    );
  }
}