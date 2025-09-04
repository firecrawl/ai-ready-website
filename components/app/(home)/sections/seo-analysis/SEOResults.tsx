"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, TrendingUp, Globe, Shield, Code, Eye, Link, 
  Target, BarChart3, Users, Clock, FileText, CheckCircle, 
  AlertTriangle, XCircle, ChevronRight, ExternalLink
} from "lucide-react";
import { useEffect, useState } from "react";
import React from "react";

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
  prominence: number;
  relevance: 'high' | 'medium' | 'low';
}

interface SEOAnalysisData {
  success: boolean;
  url: string;
  domain: string;
  overallSEOScore: number;
  categoryScores: {
    technical: number;
    content: number;
    keywords: number;
    backlinks: number;
    competition: number;
  };
  seoResults: SEOResult[];
  keywordAnalysis: {
    topKeywords: KeywordAnalysis[];
    totalKeywords: number;
    primaryKeywords: KeywordAnalysis[];
    keywordDensity: number;
  };
  contentMetrics: {
    wordCount: number;
    readingTime: number;
    headingCount: number;
    internalLinks: number;
    externalLinks: number;
    imageCount: number;
  };
  metadata: {
    title: string;
    description: string;
    analyzedAt: string;
  };
}

interface SEOResultsProps {
  isAnalyzing: boolean;
  showResults: boolean;
  analysisData: SEOAnalysisData | null;
  onReset: () => void;
}

const analysisSteps = [
  "Scraping website content...",
  "Analyzing technical SEO...",
  "Extracting keywords...",
  "Calculating domain authority...",
  "Generating competitive insights...",
];

const categoryIcons = {
  technical: Shield,
  content: FileText,
  keywords: Search,
  backlinks: Link,
  competition: TrendingUp,
};

const categoryNames = {
  technical: 'Technical SEO',
  content: 'Content Quality',
  keywords: 'Keyword Optimization',
  backlinks: 'Backlinks & Authority',
  competition: 'Competitive Position',
};

export default function SEOResults({ 
  isAnalyzing, 
  showResults, 
  analysisData, 
  onReset 
}: SEOResultsProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Simulate analysis steps
  useEffect(() => {
    if (isAnalyzing) {
      const stepDuration = 800;
      const totalSteps = analysisSteps.length;
      
      analysisSteps.forEach((_, index) => {
        setTimeout(() => {
          setAnalysisStep(index);
        }, index * stepDuration);
      });
    }
  }, [isAnalyzing]);

  // Animate score display
  useEffect(() => {
    if (showResults && analysisData) {
      const target = analysisData.overallSEOScore;
      const duration = 1500;
      const increment = target / (duration / 16);
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setDisplayScore(target);
          clearInterval(timer);
        } else {
          setDisplayScore(Math.floor(current));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [showResults, analysisData]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#eab308";
    return "#ef4444";
  };

  const getStatusColor = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass': return "#22c55e";
      case 'warning': return "#eab308";
      case 'fail': return "#ef4444";
    }
  };

  const getStatusIcon = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'fail': return XCircle;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {/* Analyzing State */}
      {isAnalyzing && (
        <motion.div
          key="seo-analyzing"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-24"
        >
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-accent-black mb-8">
              SEO Analysis in Progress
            </h2>
            <p className="text-body-medium text-black-alpha-64">
              Running comprehensive SEO audit...
            </p>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-3 bg-black-alpha-4 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                initial={{ width: "0%" }}
                animate={{ width: `${((analysisStep + 1) / analysisSteps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full"
              style={{ 
                left: `${((analysisStep + 1) / analysisSteps.length) * 100}%`,
                boxShadow: "0 0 20px rgba(59, 130, 246, 0.8)",
              }}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{ 
                duration: 0.8,
                repeat: Infinity,
              }}
            />
          </div>
          
          {/* Status Text */}
          <motion.div 
            key={analysisStep}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-12 text-body-medium text-black-alpha-64 justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Search className="w-20 h-20 text-blue-500" />
            </motion.div>
            {analysisSteps[analysisStep]}
          </motion.div>
        </motion.div>
      )}
      
      {/* Results State */}
      {showResults && analysisData && (
        <motion.div
          key="seo-results"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-32"
        >
          {/* Overall Score */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="relative inline-block mb-16"
            >
              <motion.div
                className="absolute inset-0 rounded-full blur-xl"
                style={{ background: getScoreColor(analysisData.overallSEOScore) }}
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <div 
                className="relative w-140 h-140 rounded-full flex flex-col items-center justify-center"
                style={{ 
                  background: `conic-gradient(from 0deg, ${getScoreColor(analysisData.overallSEOScore)} ${displayScore * 3.6}deg, #f0f0f0 ${displayScore * 3.6}deg)`,
                  padding: "6px",
                }}
              >
                <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl font-bold"
                    style={{ color: getScoreColor(analysisData.overallSEOScore) }}
                  >
                    {displayScore}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-label-medium text-black-alpha-48"
                  >
                    SEO Score
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold text-accent-black">
                {analysisData.domain}
              </h3>
              <p className="text-body-medium text-black-alpha-64">
                {analysisData.overallSEOScore >= 80 ? 'Excellent SEO Performance' :
                 analysisData.overallSEOScore >= 60 ? 'Good SEO Foundation' :
                 'Needs SEO Improvement'}
              </p>
            </motion.div>
          </div>

          {/* Category Scores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="grid grid-cols-5 gap-12"
          >
            {Object.entries(analysisData.categoryScores).map(([category, score], index) => {
              const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  className={`
                    p-16 rounded-12 border cursor-pointer transition-all hover:shadow-md
                    ${selectedCategory === category ? 'border-blue-500 bg-blue-50' : 'border-black-alpha-8 bg-white'}
                  `}
                >
                  <div className="flex flex-col items-center space-y-8">
                    <IconComponent 
                      className={`w-24 h-24 ${selectedCategory === category ? 'text-blue-600' : 'text-black-alpha-48'}`} 
                    />
                    <div className="text-center">
                      <div 
                        className="text-2xl font-bold mb-2"
                        style={{ color: getScoreColor(Math.round(score)) }}
                      >
                        {Math.round(score)}
                      </div>
                      <div className="text-label-small text-black-alpha-64">
                        {categoryNames[category as keyof typeof categoryNames]}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Detailed Results */}
          <AnimatePresence>
            {selectedCategory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-16"
              >
                <h4 className="text-lg font-semibold text-accent-black flex items-center gap-8">
                  {React.createElement(categoryIcons[selectedCategory as keyof typeof categoryIcons], {
                    className: "w-20 h-20"
                  })}
                  {categoryNames[selectedCategory as keyof typeof categoryNames]} Details
                </h4>

                <div className="grid gap-12">
                  {analysisData.seoResults
                    .filter(result => result.category === selectedCategory)
                    .map((result, index) => {
                      const StatusIcon = getStatusIcon(result.status);
                      return (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-16 rounded-12 border border-black-alpha-8 bg-white"
                        >
                          <div className="flex items-start gap-16">
                            <div className="flex-shrink-0">
                              <StatusIcon 
                                className="w-20 h-20"
                                style={{ color: getStatusColor(result.status) }}
                              />
                            </div>
                            <div className="flex-1 space-y-8">
                              <div className="flex items-center justify-between">
                                <h5 className="font-semibold text-accent-black">
                                  {result.label}
                                </h5>
                                <span 
                                  className="px-8 py-4 rounded-6 text-label-small font-medium"
                                  style={{ 
                                    color: getStatusColor(result.status),
                                    backgroundColor: `${getStatusColor(result.status)}20`
                                  }}
                                >
                                  {result.score}/100
                                </span>
                              </div>
                              <p className="text-body-small text-black-alpha-64">
                                {result.details}
                              </p>
                              <div className="p-12 bg-blue-50 rounded-8 border border-blue-200">
                                <p className="text-body-small text-blue-800">
                                  <strong>Recommendation:</strong> {result.recommendation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-16"
          >
            {[
              {
                label: "Content Length",
                value: `${analysisData.contentMetrics.wordCount} words`,
                icon: FileText,
                color: "#3b82f6"
              },
              {
                label: "Reading Time",
                value: `${analysisData.contentMetrics.readingTime} min`,
                icon: Clock,
                color: "#10b981"
              },
              {
                label: "Top Keywords",
                value: `${analysisData.keywordAnalysis.primaryKeywords.length} primary`,
                icon: Target,
                color: "#f59e0b"
              },
              {
                label: "Internal Links",
                value: `${analysisData.contentMetrics.internalLinks} links`,
                icon: Link,
                color: "#ef4444"
              }
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 + index * 0.1 }}
                className="p-16 rounded-12 bg-white border border-black-alpha-8"
              >
                <div className="flex items-center gap-12">
                  <metric.icon 
                    className="w-20 h-20" 
                    style={{ color: metric.color }}
                  />
                  <div>
                    <div className="text-body-small text-black-alpha-64">
                      {metric.label}
                    </div>
                    <div className="font-semibold text-accent-black">
                      {metric.value}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Top Keywords */}
          {analysisData.keywordAnalysis.topKeywords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="p-20 rounded-12 bg-white border border-black-alpha-8"
            >
              <h4 className="text-lg font-semibold text-accent-black mb-16 flex items-center gap-8">
                <Search className="w-20 h-20" />
                Top Keywords
              </h4>
              <div className="flex flex-wrap gap-8">
                {analysisData.keywordAnalysis.topKeywords.slice(0, 10).map((keyword, index) => (
                  <motion.span
                    key={keyword.keyword}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.7 + index * 0.05 }}
                    className={`
                      px-12 py-6 rounded-6 text-label-small font-medium
                      ${keyword.relevance === 'high' ? 'bg-green-100 text-green-800' :
                        keyword.relevance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-600'}
                    `}
                  >
                    {keyword.keyword}
                    <span className="ml-4 text-xs opacity-75">
                      ({keyword.frequency})
                    </span>
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="flex gap-12"
          >
            <button
              onClick={onReset}
              className="flex-1 px-20 py-12 bg-black-alpha-4 hover:bg-black-alpha-6 rounded-8 text-label-medium transition-all"
            >
              Analyze Another Site
            </button>
            <button
              onClick={() => window.open(`https://pagespeed.web.dev/report?url=${encodeURIComponent(analysisData.url)}`, '_blank')}
              className="flex-1 px-20 py-12 bg-blue-500 hover:bg-blue-600 text-white rounded-8 text-label-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-8"
            >
              PageSpeed Insights
              <ExternalLink className="w-16 h-16" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}