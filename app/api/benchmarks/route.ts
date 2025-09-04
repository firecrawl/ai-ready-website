import { NextRequest, NextResponse } from 'next/server';
import { db, classifyIndustry } from '@/lib/database';

// Get benchmarks and competitive analysis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const industry = searchParams.get('industry');

    let targetIndustry = industry;
    
    // If URL provided, classify its industry
    if (url && !industry) {
      const latestAnalysis = await db.getLatestAnalysis(url);
      targetIndustry = classifyIndustry(
        url, 
        latestAnalysis?.metadata?.title, 
        latestAnalysis?.metadata?.description
      );
    }

    // Get industry benchmark
    const benchmark = targetIndustry ? await db.getBenchmark(targetIndustry) : null;
    
    // Get top performing sites overall and by industry
    const topSites = await db.getTopPerformingSites(targetIndustry, 10);
    const allTopSites = await db.getTopPerformingSites(undefined, 5);

    // Get user's current position if URL provided
    let userRanking = null;
    if (url) {
      const userAnalysis = await db.getLatestAnalysis(url);
      if (userAnalysis) {
        const allSites = await db.getTopPerformingSites(targetIndustry, 1000);
        const userRank = allSites.findIndex(site => site.url === url) + 1;
        const percentile = userRank > 0 ? Math.round((1 - (userRank - 1) / allSites.length) * 100) : 0;
        
        userRanking = {
          rank: userRank || 'Unranked',
          percentile,
          totalSites: allSites.length,
          score: userAnalysis.score
        };
      }
    }

    // Calculate industry insights
    const industryInsights = {
      commonIssues: getCommonIssuesForIndustry(targetIndustry || 'general'),
      improvementTips: getIndustrySpecificTips(targetIndustry || 'general'),
      benchmarkDescription: getBenchmarkDescription(targetIndustry || 'general')
    };

    return NextResponse.json({
      success: true,
      industry: targetIndustry,
      benchmark,
      topSites,
      allTopSites,
      userRanking,
      industryInsights
    });

  } catch (error) {
    console.error('Benchmarks retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve benchmarks' },
      { status: 500 }
    );
  }
}

function getCommonIssuesForIndustry(industry: string): string[] {
  const issues: { [key: string]: string[] } = {
    'ecommerce': [
      'Product pages lack structured data markup',
      'Poor image alt text for product photos', 
      'Missing breadcrumb navigation',
      'Inadequate product descriptions for AI understanding'
    ],
    'tech-saas': [
      'API documentation not machine-readable',
      'Missing technical metadata in code examples',
      'Inconsistent heading structure in docs',
      'No semantic markup for code snippets'
    ],
    'news-media': [
      'Articles missing publication dates',
      'No author markup in article schema',
      'Poor headline structure for AI parsing',
      'Missing topic categorization metadata'
    ],
    'healthcare': [
      'Medical content lacks authoritative source citations',
      'Missing medical schema markup',
      'Poor accessibility for screen readers',
      'Inadequate fact verification metadata'
    ],
    'education': [
      'Course content not structured for AI understanding',
      'Missing educational resource metadata',
      'Poor learning objective markup',
      'No difficulty level indicators'
    ],
    'finance': [
      'Financial data lacks structured markup',
      'Missing regulatory compliance metadata',
      'Poor risk disclosure formatting',
      'Inadequate contact information structure'
    ],
    'general': [
      'Inconsistent heading hierarchy',
      'Missing or poor meta descriptions',
      'No structured data markup',
      'Poor semantic HTML usage'
    ]
  };

  return issues[industry] || issues['general'];
}

function getIndustrySpecificTips(industry: string): string[] {
  const tips: { [key: string]: string[] } = {
    'ecommerce': [
      'Add Product schema markup with pricing and availability',
      'Use clear product categorization with breadcrumbs',
      'Include detailed product specifications in structured format',
      'Add review and rating schema markup'
    ],
    'tech-saas': [
      'Structure API documentation with clear examples',
      'Add code schema markup for better parsing',
      'Use consistent naming conventions across documentation',
      'Include version information and compatibility data'
    ],
    'news-media': [
      'Implement Article schema with publication dates',
      'Add proper author and organization markup',
      'Use clear headline hierarchy and topic tags',
      'Include source citations and fact-check information'
    ],
    'healthcare': [
      'Add medical organization and practitioner schema',
      'Include authoritative source links for medical claims',
      'Use clear condition and treatment markup',
      'Add medical review dates and reviewer information'
    ],
    'education': [
      'Structure courses with clear learning objectives',
      'Add educational level and prerequisite information',
      'Use Course and EducationalOrganization schema',
      'Include instructor credentials and affiliations'
    ],
    'finance': [
      'Add FinancialService schema markup',
      'Include clear regulatory disclosures',
      'Structure fee information transparently',
      'Add contact information for customer service'
    ],
    'general': [
      'Implement proper heading hierarchy (H1 → H2 → H3)',
      'Add comprehensive meta descriptions (70-160 chars)',
      'Use semantic HTML elements appropriately',
      'Include clear navigation and site structure'
    ]
  };

  return tips[industry] || tips['general'];
}

function getBenchmarkDescription(industry: string): string {
  const descriptions: { [key: string]: string } = {
    'ecommerce': 'E-commerce sites are evaluated on product data structure, shopping experience optimization, and conversion-focused AI compatibility.',
    'tech-saas': 'Technology and SaaS platforms are measured by documentation quality, API accessibility, and developer experience optimization.',
    'news-media': 'News and media sites are assessed on article structure, source attribution, and content discoverability for AI systems.',
    'healthcare': 'Healthcare websites are evaluated on medical information accuracy, authoritative sourcing, and patient-focused accessibility.',
    'education': 'Educational platforms are measured by learning content structure, accessibility, and pedagogical information organization.',
    'finance': 'Financial services are assessed on regulatory compliance, transparency, and trustworthiness indicators for AI systems.',
    'general': 'General websites are evaluated across universal AI readiness factors including structure, metadata, and semantic markup.'
  };

  return descriptions[industry] || descriptions['general'];
}