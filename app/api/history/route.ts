import { NextRequest, NextResponse } from 'next/server';
import { db, classifyIndustry } from '@/lib/database';

// Get analysis history for a URL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    const history = await db.getAnalysisHistory(url, limit);
    const trend = await db.getScoreTrend(url, 30);

    return NextResponse.json({
      success: true,
      history,
      trend,
      hasHistory: history.length > 1
    });

  } catch (error) {
    console.error('History retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analysis history' },
      { status: 500 }
    );
  }
}

// Save analysis result to history
export async function POST(request: NextRequest) {
  try {
    const { url, score, checks, metadata } = await request.json();

    if (!url || typeof score !== 'number' || !checks) {
      return NextResponse.json(
        { error: 'URL, score, and checks are required' },
        { status: 400 }
      );
    }

    const analysisResult = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      score,
      checks,
      metadata: metadata || {},
      analyzedAt: new Date().toISOString(),
    };

    await db.saveAnalysis(analysisResult);

    // Update industry benchmark if we have enough data
    const industry = classifyIndustry(url, metadata?.title, metadata?.description);
    const recentAnalyses = await db.getTopPerformingSites(industry, 50);
    
    if (recentAnalyses.length >= 5) {
      const avgScore = recentAnalyses.reduce((sum, a) => sum + a.score, 0) / recentAnalyses.length;
      const topSites = recentAnalyses.slice(0, 5).map(a => ({ url: a.url, score: a.score }));
      
      await db.saveBenchmark({
        industry,
        averageScore: Math.round(avgScore),
        topSites,
        lastUpdated: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      analysisId: analysisResult.id,
      industry
    });

  } catch (error) {
    console.error('History save error:', error);
    return NextResponse.json(
      { error: 'Failed to save analysis to history' },
      { status: 500 }
    );
  }
}