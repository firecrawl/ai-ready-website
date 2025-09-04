/**
 * Unit tests for platform detection and llms.txt path generation
 * Tests the core logic without requiring a running server
 */

// Import the utility functions (we'll inline them for testing)
function detectPlatformType(url, html = '') {
  const urlLower = url.toLowerCase();
  const htmlLower = html.toLowerCase();
  
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

function getLlmsPaths(platformType) {
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

// Test cases
const testCases = [
  {
    name: 'Shopify URL Detection',
    url: 'https://allbirds.myshopify.com',
    html: '',
    expectedPlatform: 'shopify',
    expectedPathCount: 14 // 5 base + 9 shopify-specific
  },
  {
    name: 'Shopify HTML Detection',
    url: 'https://allbirds.com',
    html: '<script>var Shopify = {}; window.shop = new ShopifyAnalytics();</script>',
    expectedPlatform: 'shopify',
    expectedPathCount: 14
  },
  {
    name: 'WordPress Detection',
    url: 'https://example.com',
    html: '<link rel="stylesheet" href="/wp-content/themes/theme/style.css">',
    expectedPlatform: 'wordpress', 
    expectedPathCount: 10 // 5 base + 5 wordpress-specific
  },
  {
    name: 'Generic Site',
    url: 'https://example.com',
    html: '<title>Regular Website</title>',
    expectedPlatform: 'generic',
    expectedPathCount: 11 // 5 base + 6 generic paths
  },
  {
    name: 'Documentation Site (Generic)',
    url: 'https://docs.example.com',
    html: '',
    expectedPlatform: 'generic',
    expectedPathCount: 11
  }
];

function runTests() {
  console.log('🧪 Platform Detection and Path Generation Tests');
  console.log('='.repeat(50));
  
  let passed = 0;
  let total = testCases.length;
  
  for (const testCase of testCases) {
    console.log(`\n🔍 Test: ${testCase.name}`);
    
    const detectedPlatform = detectPlatformType(testCase.url, testCase.html);
    const paths = getLlmsPaths(detectedPlatform);
    
    const platformMatch = detectedPlatform === testCase.expectedPlatform;
    const pathCountMatch = paths.length === testCase.expectedPathCount;
    
    if (platformMatch && pathCountMatch) {
      console.log(`✅ PASS`);
      console.log(`   Platform: ${detectedPlatform} ✓`);
      console.log(`   Paths: ${paths.length} ✓`);
      passed++;
    } else {
      console.log(`❌ FAIL`);
      console.log(`   Platform: ${detectedPlatform} (expected: ${testCase.expectedPlatform}) ${platformMatch ? '✓' : '❌'}`);
      console.log(`   Paths: ${paths.length} (expected: ${testCase.expectedPathCount}) ${pathCountMatch ? '✓' : '❌'}`);
      
      if (!pathCountMatch) {
        console.log(`   Actual paths: ${paths.join(', ')}`);
      }
    }
  }
  
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
  } else {
    console.log(`⚠️  ${total - passed} test(s) failed`);
  }
  
  // Show example paths for Shopify
  console.log('\n📋 Example Shopify Paths:');
  const shopifyPaths = getLlmsPaths('shopify');
  shopifyPaths.forEach(path => console.log(`   /${path}`));
}

// Additional validation test
function validateLlmsContent() {
  console.log('\n\n🧪 LLMs.txt Content Validation Tests');
  console.log('='.repeat(50));
  
  const contentTests = [
    {
      name: 'Valid LLMs.txt',
      content: '# AI Usage Guidelines\nThis site allows AI crawling for research purposes.\nContact: admin@example.com',
      expectedValid: true
    },
    {
      name: '404 Page', 
      content: '<html><head><title>404 Not Found</title></head><body>Page not found</body></html>',
      expectedValid: false
    },
    {
      name: 'Empty File',
      content: '',
      expectedValid: false
    },
    {
      name: 'Short Valid Content',
      content: 'AI crawling allowed',
      expectedValid: true
    },
    {
      name: 'HTML Error Page',
      content: '<!DOCTYPE html><html><body><h1>404 - Not Found</h1></body></html>',
      expectedValid: false
    },
    {
      name: 'Structured Data',
      content: 'crawl-allowed: true\ncontact: example@test.com\nusage: research',
      expectedValid: true
    }
  ];
  
  function isValidLlmsContent(text) {
    return (
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
  }
  
  let validationPassed = 0;
  for (const test of contentTests) {
    const result = isValidLlmsContent(test.content);
    const match = result === test.expectedValid;
    
    console.log(`${match ? '✅' : '❌'} ${test.name}: ${result} (expected: ${test.expectedValid})`);
    if (match) validationPassed++;
  }
  
  console.log(`\n📊 Validation Results: ${validationPassed}/${contentTests.length} tests passed`);
}

// Run all tests
runTests();
validateLlmsContent();

console.log('\n🎯 Summary:');
console.log('- Enhanced platform detection for Shopify, WordPress, and generic sites');
console.log('- Comprehensive path checking for different platforms');
console.log('- Improved content validation to avoid false positives');
console.log('- Shopify sites now check 14+ paths vs original 3 paths');