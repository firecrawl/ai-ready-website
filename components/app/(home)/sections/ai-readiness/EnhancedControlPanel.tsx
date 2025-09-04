"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen,
  TrendingUp,
  Target,
  Download,
  FileText,
  Code,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Trophy
} from "lucide-react";
import { useState } from "react";
import HistoricalTrends from "./HistoricalTrends";
import ImplementationGuide from "./ImplementationGuide";

interface EnhancedControlPanelProps {
  isAnalyzing: boolean;
  showResults: boolean;
  url: string;
  analysisData?: any;
  onReset: () => void;
}

interface CheckItem {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warning';
  score: number;
  details: string;
  recommendation: string;
}

export default function EnhancedControlPanel({
  showResults,
  url,
  analysisData,
  onReset,
}: EnhancedControlPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'benchmarks' | 'export'>('overview');
  const [selectedCheck, setSelectedCheck] = useState<string | null>(null);
  const [showImplementationGuide, setShowImplementationGuide] = useState(false);

  if (!showResults || !analysisData) return null;

  const overallScore = analysisData.overallScore || 0;
  const checks: CheckItem[] = analysisData.checks || [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Analysis Results', icon: FileText },
    { id: 'history', label: 'Historical Trends', icon: TrendingUp },
    { id: 'benchmarks', label: 'Competitive Analysis', icon: Trophy },
    { id: 'export', label: 'Export & API', icon: Download }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">AI Readiness Report</h2>
            <p className="opacity-90 text-sm">{url}</p>
          </div>
          
          <div className="text-right">
            <div className={`text-4xl font-bold mb-1 ${getScoreColor(overallScore)} bg-white px-4 py-2 rounded-lg`}>
              {overallScore}
            </div>
            <div className="text-sm opacity-90">AI Ready Score</div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onReset}
            className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors text-sm font-medium"
          >
            Analyze Another Site
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Results
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {checks.filter(c => c.status === 'pass').length}
                  </div>
                  <div className="text-green-700 text-sm">Checks Passed</div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {checks.filter(c => c.status === 'warning').length}
                  </div>
                  <div className="text-yellow-700 text-sm">Warnings</div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {checks.filter(c => c.status === 'fail').length}
                  </div>
                  <div className="text-red-700 text-sm">Failed Checks</div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Detailed Analysis</h3>
                
                {checks.map((check) => (
                  <div
                    key={check.id}
                    className={`border rounded-lg p-4 transition-colors ${getScoreBg(check.score)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(check.status)}
                          <h4 className="font-medium text-gray-900">{check.label}</h4>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(check.score)} bg-white`}>
                            {check.score}/100
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-2">{check.details}</p>
                        
                        <div className="bg-white bg-opacity-50 rounded p-3">
                          <p className="text-sm font-medium text-gray-900 mb-1">Recommendation:</p>
                          <p className="text-sm text-gray-700">{check.recommendation}</p>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setSelectedCheck(check.id);
                            setShowImplementationGuide(true);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <BookOpen className="w-3 h-3" />
                          Guide
                        </button>
                        
                        <button
                          onClick={() => setActiveTab('benchmarks')}
                          className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                        >
                          <Target className="w-3 h-3" />
                          Compare
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HistoricalTrends
                url={url}
                currentScore={overallScore}
                isVisible={true}
              />
            </motion.div>
          )}

          {activeTab === 'benchmarks' && (
            <motion.div
              key="benchmarks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Competitive Benchmarking</h3>
                <p className="text-gray-600 mb-6">
                  Compare your AI readiness score against industry leaders and competitors.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
                  <div className="text-blue-800 font-medium mb-2">Coming Soon!</div>
                  <p className="text-blue-700 text-sm">
                    We&apos;re building comprehensive industry benchmarks and competitive analysis features. 
                    Your site will be automatically compared against similar websites in your industry.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Export & API Access</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Options */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export Results
                  </h4>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        const data = JSON.stringify(analysisData, null, 2);
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `ai-readiness-report-${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">JSON Report</div>
                      <div className="text-sm text-gray-600">Machine-readable analysis results</div>
                    </button>
                    
                    <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-medium">PDF Report</div>
                      <div className="text-sm text-gray-600">Human-readable summary (Coming Soon)</div>
                    </button>
                    
                    <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-medium">CSV Data</div>
                      <div className="text-sm text-gray-600">Spreadsheet-compatible format (Coming Soon)</div>
                    </button>
                  </div>
                </div>

                {/* API Access */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    API Access
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded p-3">
                      <div className="text-sm font-mono text-gray-800">
                        POST /api/ai-readiness
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Analyze any website programmatically
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded p-3">
                      <div className="text-sm font-mono text-gray-800">
                        GET /api/history?url=...
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Get historical analysis data
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <div className="text-blue-800 font-medium text-sm mb-1">Developer API</div>
                      <div className="text-blue-700 text-xs">
                        Coming soon: Full REST API with authentication, rate limiting, and webhooks.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Implementation Guide Modal */}
      <ImplementationGuide
        checkId={selectedCheck || ''}
        checkTitle={selectedCheck ? checks.find(c => c.id === selectedCheck)?.label || '' : ''}
        isVisible={showImplementationGuide}
        onClose={() => {
          setShowImplementationGuide(false);
          setSelectedCheck(null);
        }}
      />
    </div>
  );
}