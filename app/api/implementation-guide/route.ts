import { NextRequest, NextResponse } from 'next/server';

interface ImplementationStep {
  id: string;
  title: string;
  description: string;
  codeExample?: {
    language: string;
    before?: string;
    after: string;
    explanation: string;
  };
  cms?: {
    wordpress?: string;
    shopify?: string;
    wix?: string;
  };
  priority: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  impact: string;
}

interface ImplementationGuide {
  checkId: string;
  title: string;
  overview: string;
  steps: ImplementationStep[];
  resources: { title: string; url: string; description: string }[];
  commonMistakes: string[];
}

const implementationGuides: { [key: string]: ImplementationGuide } = {
  'heading-structure': {
    checkId: 'heading-structure',
    title: 'Fix Heading Structure for AI Readiness',
    overview: 'Proper heading hierarchy helps AI systems understand your content structure and topic organization. This guide shows you how to create a logical H1→H2→H3 flow that both users and AI can easily navigate.',
    steps: [
      {
        id: 'audit-current-headings',
        title: 'Audit Your Current Headings',
        description: 'First, identify all headings on your page and check for hierarchy issues.',
        codeExample: {
          language: 'javascript',
          after: `// Use this browser console script to audit headings
const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
const headingStructure = Array.from(headings).map(h => ({
  level: parseInt(h.tagName.charAt(1)),
  text: h.textContent?.slice(0, 50) + '...',
  element: h
}));

console.table(headingStructure);

// Check for issues
const h1Count = document.querySelectorAll('h1').length;
if (h1Count === 0) console.warn('❌ No H1 found');
if (h1Count > 1) console.warn('❌ Multiple H1s found:', h1Count);`,
          explanation: 'Run this in your browser console to see your current heading structure and identify issues.'
        },
        priority: 'high',
        difficulty: 'easy',
        estimatedTime: '5 minutes',
        impact: 'Provides clear overview of current heading issues'
      },
      {
        id: 'create-single-h1',
        title: 'Ensure Single H1 Per Page',
        description: 'Each page should have exactly one H1 that describes the main topic.',
        codeExample: {
          language: 'html',
          before: `<!-- ❌ Bad: Multiple H1s -->
<h1>Welcome to Our Site</h1>
<section>
  <h1>Our Products</h1>
  <h1>About Us</h1>
</section>`,
          after: `<!-- ✅ Good: Single H1 with logical hierarchy -->
<h1>Welcome to Our Site - Your AI-Ready Solution</h1>
<section>
  <h2>Our Products</h2>
  <h2>About Us</h2>
</section>`,
          explanation: 'The H1 should be the main page title, with H2s for major sections.'
        },
        cms: {
          wordpress: 'Edit your page/post title - this automatically becomes the H1. Use "Heading 2" blocks for section titles.',
          shopify: 'In your theme editor, ensure page titles use <h1> tags. Section headings should use <h2>.',
          wix: 'Use the "Title" element for your main heading (becomes H1). Use "Heading 2" for sections.'
        },
        priority: 'high',
        difficulty: 'easy',
        estimatedTime: '10 minutes',
        impact: 'Dramatically improves AI topic understanding'
      },
      {
        id: 'establish-hierarchy',
        title: 'Create Logical Heading Hierarchy',
        description: 'Structure your headings in a logical flow without skipping levels.',
        codeExample: {
          language: 'html',
          before: `<!-- ❌ Bad: Skipped levels -->
<h1>API Documentation</h1>
<h4>Getting Started</h4>
<h2>Authentication</h2>
<h4>Rate Limits</h4>`,
          after: `<!-- ✅ Good: Logical hierarchy -->
<h1>API Documentation</h1>
<h2>Getting Started</h2>
  <h3>Quick Setup</h3>
  <h3>First API Call</h3>
<h2>Authentication</h2>
  <h3>API Keys</h3>
  <h3>OAuth Flow</h3>
<h2>Rate Limits</h2>
  <h3>Limits by Plan</h3>`,
          explanation: 'Each level should be a logical subdivision of the level above it. Never skip levels (H1→H3).'
        },
        priority: 'high',
        difficulty: 'medium',
        estimatedTime: '30 minutes',
        impact: 'Enables AI to understand content relationships and structure'
      },
      {
        id: 'descriptive-headings',
        title: 'Make Headings Descriptive',
        description: 'Use clear, descriptive headings that explain what the section contains.',
        codeExample: {
          language: 'html',
          before: `<!-- ❌ Bad: Vague headings -->
<h1>Welcome</h1>
<h2>Setup</h2>
<h2>Info</h2>
<h2>More</h2>`,
          after: `<!-- ✅ Good: Descriptive headings -->
<h1>Complete Guide to API Authentication</h1>
<h2>Initial Setup Requirements</h2>
<h2>Generating Your API Keys</h2>
<h2>Advanced Security Options</h2>`,
          explanation: 'Headings should clearly describe the content that follows. This helps both users and AI understand the topic.'
        },
        priority: 'medium',
        difficulty: 'easy',
        estimatedTime: '20 minutes',
        impact: 'Improves content scannability and AI topic extraction'
      }
    ],
    resources: [
      {
        title: 'MDN Web Docs: HTML Headings',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements',
        description: 'Complete reference for HTML heading elements and best practices'
      },
      {
        title: 'WCAG Heading Guidelines',
        url: 'https://www.w3.org/WAI/WCAG21/Techniques/html/H69.html',
        description: 'Accessibility guidelines for proper heading structure'
      },
      {
        title: 'Google SEO Heading Best Practices',
        url: 'https://developers.google.com/search/docs/appearance/structured-data',
        description: 'How search engines and AI systems parse heading structure'
      }
    ],
    commonMistakes: [
      'Using headings for styling instead of structure (use CSS for appearance)',
      'Skipping heading levels (H1 → H3) which breaks the logical flow',
      'Having multiple H1s per page which creates topic confusion',
      'Using generic headings like "Info" or "More" instead of descriptive titles',
      'Making headings too long (keep under 70 characters when possible)'
    ]
  },

  'meta-tags': {
    checkId: 'meta-tags',
    title: 'Optimize Metadata for AI Discovery',
    overview: 'Meta tags provide crucial context that helps AI systems understand your content before processing it. This guide covers essential meta tags and structured data for maximum AI compatibility.',
    steps: [
      {
        id: 'essential-meta-tags',
        title: 'Add Essential Meta Tags',
        description: 'Implement the core meta tags that AI systems rely on for content understanding.',
        codeExample: {
          language: 'html',
          after: `<!-- Essential Meta Tags -->
<head>
  <title>Complete Guide to API Authentication - YourSite</title>
  <meta name="description" content="Learn how to implement secure API authentication with step-by-step examples, best practices, and troubleshooting guides for developers.">
  <meta name="author" content="Jane Smith">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph for AI and social platforms -->
  <meta property="og:title" content="Complete Guide to API Authentication">
  <meta property="og:description" content="Learn how to implement secure API authentication with step-by-step examples, best practices, and troubleshooting guides for developers.">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://yoursite.com/api-auth-guide">
  <meta property="og:image" content="https://yoursite.com/images/api-guide-cover.jpg">
  
  <!-- Article-specific metadata -->
  <meta property="article:published_time" content="2024-01-15T10:00:00Z">
  <meta property="article:modified_time" content="2024-01-20T15:30:00Z">
  <meta property="article:author" content="Jane Smith">
  <meta property="article:section" content="Developer Guides">
  <meta property="article:tag" content="API, Authentication, Security, Developers">
</head>`,
          explanation: 'These meta tags provide essential context about your content\'s topic, authorship, and purpose.'
        },
        cms: {
          wordpress: 'Use an SEO plugin like Yoast or Rank Math to easily add meta tags, or edit them directly in Appearance > Theme Editor.',
          shopify: 'Go to Online Store > Preferences to edit homepage meta tags, or edit individual page meta tags in the page editor.',
          wix: 'Access meta tags through Settings > SEO (Google) > Meta tags, or use Wix SEO Wiz for guided setup.'
        },
        priority: 'high',
        difficulty: 'easy',
        estimatedTime: '15 minutes',
        impact: 'Provides crucial context for AI content understanding'
      },
      {
        id: 'structured-data',
        title: 'Add JSON-LD Structured Data',
        description: 'Implement structured data markup to help AI systems understand your content type and relationships.',
        codeExample: {
          language: 'json',
          after: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Complete Guide to API Authentication",
  "description": "Learn how to implement secure API authentication with step-by-step examples and best practices.",
  "image": "https://yoursite.com/images/api-guide-cover.jpg",
  "author": {
    "@type": "Person",
    "name": "Jane Smith",
    "url": "https://yoursite.com/authors/jane-smith"
  },
  "publisher": {
    "@type": "Organization",
    "name": "YourSite",
    "logo": "https://yoursite.com/logo.png"
  },
  "datePublished": "2024-01-15T10:00:00Z",
  "dateModified": "2024-01-20T15:30:00Z",
  "mainEntityOfPage": "https://yoursite.com/api-auth-guide",
  "articleSection": "Developer Guides",
  "keywords": ["API", "Authentication", "Security", "Web Development"],
  "proficiencyLevel": "Intermediate",
  "dependencies": ["JavaScript", "HTTP basics"],
  "operatingSystem": "Any"
}
</script>`,
          explanation: 'JSON-LD structured data provides rich context about your content in a format AI systems can easily parse.'
        },
        priority: 'high',
        difficulty: 'medium',
        estimatedTime: '30 minutes',
        impact: 'Dramatically improves AI content classification and understanding'
      }
    ],
    resources: [
      {
        title: 'Schema.org Documentation',
        url: 'https://schema.org/',
        description: 'Complete reference for structured data vocabulary'
      },
      {
        title: 'Google Structured Data Testing Tool',
        url: 'https://search.google.com/test/rich-results',
        description: 'Test and validate your structured data markup'
      },
      {
        title: 'Open Graph Protocol',
        url: 'https://ogp.me/',
        description: 'Specification for Open Graph meta tags'
      }
    ],
    commonMistakes: [
      'Meta descriptions that are too short (<50 chars) or too long (>160 chars)',
      'Using the same meta description across multiple pages',
      'Forgetting to update meta tags when content changes',
      'Using structured data types that don\'t match your content',
      'Missing required properties in structured data schemas'
    ]
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkId = searchParams.get('checkId');

    if (!checkId) {
      // Return list of available guides
      const guidesList = Object.keys(implementationGuides).map(id => ({
        id,
        title: implementationGuides[id].title,
        overview: implementationGuides[id].overview
      }));

      return NextResponse.json({
        success: true,
        guides: guidesList
      });
    }

    const guide = implementationGuides[checkId];
    if (!guide) {
      return NextResponse.json(
        { error: 'Implementation guide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      guide
    });

  } catch (error) {
    console.error('Implementation guide error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve implementation guide' },
      { status: 500 }
    );
  }
}