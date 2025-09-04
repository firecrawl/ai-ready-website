"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Target, Trophy, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface HistoryEntry {
  id: string;
  score: number;
  analyzedAt: string;
}

interface BenchmarkData {
  industry: string;
  benchmark: {
    averageScore: number;
    topSites: { url: string; score: number }[];
  };
  userRanking?: {
    rank: number | string;
    percentile: number;
    totalSites: number;
    score: number;
  };
}

interface HistoricalTrendsProps {
  url: string;
  currentScore: number;
  isVisible: boolean;
}

export default function HistoricalTrends({ url, currentScore, isVisible }: HistoricalTrendsProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable' | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    const fetchData = async () => {
      try {
        // Fetch history
        const historyResponse = await fetch(`/api/history?url=${encodeURIComponent(url)}`);
        const historyData = await historyResponse.json();
        
        if (historyData.success) {
          setHistory(historyData.history || []);
          
          // Calculate trend
          if (historyData.history && historyData.history.length > 1) {
            const previous = historyData.history[1].score;
            const current = historyData.history[0].score;
            const diff = current - previous;
            
            if (Math.abs(diff) < 2) setTrend('stable');
            else if (diff > 0) setTrend('up');
            else setTrend('down');
          }
        }

        // Fetch benchmarks
        const benchmarkResponse = await fetch(`/api/benchmarks?url=${encodeURIComponent(url)}`);
        const benchmarkData = await benchmarkResponse.json();
        
        if (benchmarkData.success) {
          setBenchmarks(benchmarkData);
        }
      } catch (error) {
        console.error('Failed to fetch trends and benchmarks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, isVisible]);

  if (!isVisible || loading) return null;

  const hasHistory = history.length > 1;
  const previousScore = hasHistory ? history[1].score : null;
  const scoreDiff = previousScore ? currentScore - previousScore : null;

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50 border-green-200';
      case 'down': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-6 mt-8"
    >
      {/* Historical Trend */}
      {hasHistory && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Score History
            </h3>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {scoreDiff ? (
                  scoreDiff > 0 ? `+${scoreDiff} points` : `${scoreDiff} points`
                ) : 'First analysis'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{currentScore}</div>
              <div className="text-sm text-gray-600">Current Score</div>
            </div>
            
            {previousScore && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{previousScore}</div>
                <div className="text-sm text-gray-600">Previous Score</div>
              </div>
            )}
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{history.length}</div>
              <div className="text-sm text-gray-600">Total Analyses</div>
            </div>
          </div>

          {/* Mini timeline */}
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Recent Analysis History</div>
            <div className="flex space-x-2 overflow-x-auto">
              {history.slice(0, 5).map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex-shrink-0 p-2 rounded border ${
                    index === 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="text-lg font-semibold">{entry.score}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(entry.analyzedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Competitive Benchmarking */}
      {benchmarks && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Target className="w-5 h-5" />
            Industry Benchmarks
            <span className="text-sm font-normal text-gray-600 capitalize">
              ({benchmarks.industry?.replace('-', ' ') || 'general'})
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* User's Position */}
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{currentScore}</div>
              <div className="text-sm text-blue-700">Your Score</div>
              {benchmarks.userRanking && (
                <div className="text-xs text-blue-600 mt-1">
                  {benchmarks.userRanking.percentile}th percentile
                </div>
              )}
            </div>

            {/* Industry Average */}
            <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {benchmarks.benchmark?.averageScore || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Industry Average</div>
              <div className="text-xs text-gray-500 mt-1">
                {currentScore > (benchmarks.benchmark?.averageScore || 0) ? 
                  `+${currentScore - (benchmarks.benchmark?.averageScore || 0)} above average` :
                  `${(benchmarks.benchmark?.averageScore || 0) - currentScore} below average`
                }
              </div>
            </div>

            {/* Top Performer */}
            {benchmarks.benchmark?.topSites?.[0] && (
              <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-2xl font-bold text-yellow-900">
                  {benchmarks.benchmark.topSites[0].score}
                </div>
                <div className="text-sm text-yellow-700">Industry Leader</div>
                <div className="text-xs text-yellow-600 mt-1 truncate">
                  {benchmarks.benchmark.topSites[0].url}
                </div>
              </div>
            )}
          </div>

          {/* Top Performers List */}
          {benchmarks.benchmark?.topSites && benchmarks.benchmark.topSites.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Top Performers in {benchmarks.industry?.replace('-', ' ') || 'this'} Industry
              </h4>
              <div className="space-y-2">
                {benchmarks.benchmark.topSites.slice(0, 5).map((site, index) => (
                  <div
                    key={site.url}
                    className={`flex items-center justify-between p-3 rounded border ${
                      site.url === url ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-orange-300 text-orange-900' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium truncate">{site.url}</span>
                      {site.url === url && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">You</span>
                      )}
                    </div>
                    <div className="text-lg font-bold text-gray-900">{site.score}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* First Time Message */}
      {!hasHistory && !benchmarks && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="text-blue-800 font-medium mb-2">Welcome to AI Ready Website!</div>
          <div className="text-blue-600 text-sm">
            This is your first analysis. Run the analysis again in the future to see score trends and improvements over time.
          </div>
        </div>
      )}
    </motion.div>
  );
}