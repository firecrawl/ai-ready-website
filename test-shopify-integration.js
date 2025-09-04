#!/usr/bin/env node

/**
 * Test script to verify Shopify integration improvements
 * Tests the enhanced llms.txt discovery and platform detection
 */

const testUrls = [
  // Known Shopify sites for testing
  'allbirds.com',
  'gymshark.com', 
  'bulletproof.com',
  // Regular sites for comparison  
  'example.com',
  'github.com'
];

async function testLlmsDiscovery() {
  console.log('🧪 Testing Enhanced LLMs.txt Discovery for Shopify Integration\n');
  
  for (const testUrl of testUrls) {
    console.log(`\n📍 Testing: ${testUrl}`);
    console.log('=' + '='.repeat(50));
    
    try {
      // Test the check-llms endpoint
      const response = await fetch('http://localhost:3000/api/check-llms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: testUrl }),
      });
      
      if (!response.ok) {
        console.error(`❌ HTTP ${response.status}: ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      console.log(`🏷️  Platform Type: ${data.platformType}`);
      console.log(`📝 Paths Checked: ${data.pathsChecked?.length || 0}`);
      
      if (data.foundValidLlms) {
        console.log(`✅ Found valid LLMs.txt at: /${data.foundValidLlms.path}`);
        console.log(`📄 Content Preview: ${data.foundValidLlms.content.substring(0, 100)}...`);
      } else {
        console.log(`❌ No valid LLMs.txt found`);
      }
      
      if (data.checks?.length > 0) {
        const validChecks = data.checks.filter(c => c.isValidLlms);
        const httpOkChecks = data.checks.filter(c => c.fetchOk);
        console.log(`📊 Valid LLMs files found: ${validChecks.length}`);
        console.log(`📊 Successful HTTP responses: ${httpOkChecks.length}`);
      }
      
      if (data.error) {
        console.log(`⚠️  Error: ${data.error}`);
      }
      
    } catch (error) {
      console.error(`❌ Test failed for ${testUrl}:`, error.message);
    }
  }
}

async function testAIReadiness() {
  console.log('\n\n🧪 Testing AI Readiness Analysis with Shopify Support\n');
  
  // Test with a couple representative sites
  const testSites = ['allbirds.com', 'example.com'];
  
  for (const testUrl of testSites) {
    console.log(`\n📍 Testing AI Readiness: ${testUrl}`);
    console.log('=' + '='.repeat(50));
    
    try {
      const response = await fetch('http://localhost:3000/api/ai-readiness', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: testUrl }),
      });
      
      if (!response.ok) {
        console.error(`❌ HTTP ${response.status}: ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      console.log(`📊 Overall Score: ${data.overallScore}%`);
      console.log(`🔍 Total Checks: ${data.checks?.length || 0}`);
      
      // Show key metrics
      const llmsCheck = data.checks?.find(c => c.id === 'llms-txt');
      const readabilityCheck = data.checks?.find(c => c.id === 'readability');
      const metaCheck = data.checks?.find(c => c.id === 'meta-tags');
      
      if (llmsCheck) {
        console.log(`📄 LLMs.txt: ${llmsCheck.score}% (${llmsCheck.status}) - ${llmsCheck.details}`);
      }
      if (readabilityCheck) {
        console.log(`📚 Readability: ${readabilityCheck.score}% (${readabilityCheck.status})`);
      }
      if (metaCheck) {
        console.log(`🏷️  Metadata: ${metaCheck.score}% (${metaCheck.status})`);
      }
      
    } catch (error) {
      console.error(`❌ AI Readiness test failed for ${testUrl}:`, error.message);
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/check-config');
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function runTests() {
  console.log('🚀 Shopify Integration Test Suite');
  console.log('==================================\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('❌ Server not running. Please start with: npm run dev');
    console.log('\nTo run this test:');
    console.log('1. npm run dev (in one terminal)');
    console.log('2. node test-shopify-integration.js (in another terminal)');
    return;
  }
  
  console.log('✅ Server is running at http://localhost:3000\n');
  
  await testLlmsDiscovery();
  await testAIReadiness();
  
  console.log('\n\n✅ Test Suite Complete!');
  console.log('\n📋 Expected Results:');
  console.log('- Shopify sites should show platformType: "shopify"');
  console.log('- More paths should be checked for Shopify sites');
  console.log('- Sites without llms.txt should still get reasonable scores');
  console.log('- E-commerce sites should get bonus points for good structure');
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testLlmsDiscovery, testAIReadiness };