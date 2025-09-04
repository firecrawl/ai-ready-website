import { NextRequest, NextResponse } from 'next/server';

interface AnalysisData {
  url: string;
  overallScore: number;
  checks: Array<{
    id: string;
    label: string;
    status: 'pass' | 'fail' | 'warning';
    score: number;
    details: string;
    recommendation: string;
  }>;
  metadata?: {
    title?: string;
    description?: string;
    analyzedAt: string;
  };
}

function generatePDFContent(data: AnalysisData): string {
  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'pass': return '✅';
      case 'warning': return '⚠️';
      case 'fail': return '❌';
      default: return '🔍';
    }
  };

  const getGrade = (score: number): string => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    return 'F';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>AI Readiness Report - ${data.url}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #ff4d00;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .score-badge {
          display: inline-block;
          background: #ff4d00;
          color: white;
          font-size: 2.5em;
          font-weight: bold;
          padding: 20px 30px;
          border-radius: 15px;
          margin: 20px 0;
        }
        .url {
          font-size: 1.2em;
          color: #666;
          word-break: break-all;
        }
        .analysis-date {
          color: #888;
          font-size: 0.9em;
        }
        .section {
          margin: 30px 0;
        }
        .check-item {
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 20px;
          margin: 15px 0;
          background: #fafafa;
        }
        .check-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        .check-emoji {
          font-size: 1.5em;
          margin-right: 10px;
        }
        .check-title {
          font-size: 1.2em;
          font-weight: bold;
          flex: 1;
        }
        .check-score {
          font-weight: bold;
          padding: 5px 15px;
          border-radius: 20px;
          color: white;
        }
        .score-pass { background-color: #22c55e; }
        .score-warning { background-color: #eab308; }
        .score-fail { background-color: #ef4444; }
        .check-details {
          margin: 10px 0;
          color: #555;
        }
        .check-recommendation {
          background: #f0f9ff;
          border-left: 4px solid #0ea5e9;
          padding: 10px 15px;
          margin-top: 10px;
          border-radius: 0 5px 5px 0;
        }
        .summary {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 25px;
          margin: 30px 0;
          border-left: 5px solid #ff4d00;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 0.9em;
        }
        @media print {
          body { margin: 0; padding: 15px; }
          .score-badge { break-inside: avoid; }
          .check-item { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🤖 AI Readiness Report</h1>
        <div class="url">${data.url}</div>
        <div class="score-badge">${data.overallScore}/100 (${getGrade(data.overallScore)})</div>
        <div class="analysis-date">Generated on ${new Date(data.metadata?.analyzedAt || Date.now()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</div>
      </div>

      <div class="summary">
        <h2>📋 Executive Summary</h2>
        <p>Your website scored <strong>${data.overallScore}/100</strong> for AI readiness. ${
          data.overallScore >= 80 
            ? 'Excellent! Your site is well-optimized for AI systems.'
            : data.overallScore >= 60 
            ? 'Good foundation, but there are opportunities for improvement.'
            : 'Significant improvements needed to make your site more AI-friendly.'
        }</p>
        
        <p><strong>Breakdown:</strong></p>
        <ul>
          <li>✅ ${data.checks.filter(c => c.status === 'pass').length} checks passed</li>
          <li>⚠️ ${data.checks.filter(c => c.status === 'warning').length} checks need attention</li>
          <li>❌ ${data.checks.filter(c => c.status === 'fail').length} checks failed</li>
        </ul>
      </div>

      <div class="section">
        <h2>🔍 Detailed Analysis</h2>
        ${data.checks.map(check => `
          <div class="check-item">
            <div class="check-header">
              <span class="check-emoji">${getStatusEmoji(check.status)}</span>
              <span class="check-title">${check.label}</span>
              <span class="check-score score-${check.status}">${check.score}/100</span>
            </div>
            <div class="check-details">${check.details}</div>
            <div class="check-recommendation">
              <strong>💡 Recommendation:</strong> ${check.recommendation}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="footer">
        <p>Generated by AI Ready Website • Powered by Firecrawl</p>
        <p>Visit <strong>https://github.com/firecrawl/ai-ready-website</strong> to analyze your own sites</p>
      </div>
    </body>
    </html>
  `;
}

function generateCSV(data: AnalysisData): string {
  const headers = ['Check', 'Status', 'Score', 'Details', 'Recommendation'];
  const rows = data.checks.map(check => [
    check.label,
    check.status,
    check.score.toString(),
    `"${check.details.replace(/"/g, '""')}"`,
    `"${check.recommendation.replace(/"/g, '""')}"`
  ]);

  return [
    `# AI Readiness Report for ${data.url}`,
    `# Overall Score: ${data.overallScore}/100`,
    `# Generated: ${new Date(data.metadata?.analyzedAt || Date.now()).toISOString()}`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const { analysisData, format = 'html' } = await request.json();

    if (!analysisData) {
      return NextResponse.json({ error: 'Analysis data is required' }, { status: 400 });
    }

    let content: string;
    let mimeType: string;
    let filename: string;
    const timestamp = new Date().toISOString().slice(0, 10);
    const safeDomain = analysisData.url?.replace(/[^a-zA-Z0-9.-]/g, '_') || 'website';

    switch (format) {
      case 'json':
        content = JSON.stringify(analysisData, null, 2);
        mimeType = 'application/json';
        filename = `ai-readiness-${safeDomain}-${timestamp}.json`;
        break;
      
      case 'csv':
        content = generateCSV(analysisData);
        mimeType = 'text/csv';
        filename = `ai-readiness-${safeDomain}-${timestamp}.csv`;
        break;
      
      case 'html':
      default:
        content = generatePDFContent(analysisData);
        mimeType = 'text/html';
        filename = `ai-readiness-${safeDomain}-${timestamp}.html`;
        break;
    }

    const response = new NextResponse(content);
    response.headers.set('Content-Type', mimeType);
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    
    return response;

  } catch (error) {
    console.error('Download report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}