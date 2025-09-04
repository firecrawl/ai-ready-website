"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Code2, 
  Copy, 
  Check, 
  AlertCircle, 
  Clock, 
  Zap,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react";
import { useState } from "react";

interface CodeExample {
  language: string;
  before?: string;
  after: string;
  explanation: string;
}

interface ImplementationStep {
  id: string;
  title: string;
  description: string;
  codeExample?: CodeExample;
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

interface ImplementationGuideProps {
  checkId: string;
  checkTitle: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function ImplementationGuide({ 
  checkId, 
  checkTitle, 
  isVisible, 
  onClose 
}: ImplementationGuideProps) {
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedCMS, setSelectedCMS] = useState<'wordpress' | 'shopify' | 'wix' | 'code'>('code');
  const [guideData, setGuideData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch guide data when visible
  React.useEffect(() => {
    if (!isVisible || !checkId) return;

    const fetchGuide = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/implementation-guide?checkId=${checkId}`);
        const data = await response.json();
        if (data.success) {
          setGuideData(data.guide);
          // Auto-expand first step
          if (data.guide.steps.length > 0) {
            setExpandedSteps([data.guide.steps[0].id]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch implementation guide:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [isVisible, checkId]);

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const copyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '⭐';
      case 'medium': return '⭐⭐';
      case 'hard': return '⭐⭐⭐';
      default: return '⭐';
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  Implementation Guide
                </h2>
                <p className="text-gray-600 mt-1">{checkTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* CMS Selector */}
            <div className="flex gap-2 mt-4">
              <span className="text-sm text-gray-600 flex items-center">Show instructions for:</span>
              {['code', 'wordpress', 'shopify', 'wix'].map((cms) => (
                <button
                  key={cms}
                  onClick={() => setSelectedCMS(cms as any)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    selectedCMS === cms
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {cms === 'code' ? 'Custom Code' : cms.charAt(0).toUpperCase() + cms.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading implementation guide...</p>
              </div>
            ) : guideData ? (
              <div className="p-6">
                {/* Overview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Overview</h3>
                  <p className="text-blue-800 text-sm">{guideData.overview}</p>
                </div>

                {/* Implementation Steps */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg">Implementation Steps</h3>
                  
                  {guideData.steps.map((step: ImplementationStep, index: number) => (
                    <div key={step.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Step Header */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleStep(step.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{step.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(step.priority)}`}>
                                  {step.priority} priority
                                </span>
                                <span className="text-xs text-gray-500">
                                  {getDifficultyIcon(step.difficulty)} {step.difficulty}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {step.estimatedTime}
                                </span>
                              </div>
                            </div>
                          </div>
                          {expandedSteps.includes(step.id) ? 
                            <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          }
                        </div>
                      </div>

                      {/* Step Content */}
                      <AnimatePresence>
                        {expandedSteps.includes(step.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-200"
                          >
                            <div className="p-4 bg-gray-50">
                              <p className="text-gray-700 mb-4">{step.description}</p>

                              {/* Impact */}
                              <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                                <div className="flex items-center gap-2 text-green-800 text-sm">
                                  <Zap className="w-4 h-4" />
                                  <span className="font-medium">Impact:</span>
                                </div>
                                <p className="text-green-700 text-sm mt-1">{step.impact}</p>
                              </div>

                              {/* CMS Instructions */}
                              {selectedCMS !== 'code' && step.cms && step.cms[selectedCMS] && (
                                <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-4">
                                  <div className="flex items-center gap-2 text-purple-800 text-sm mb-2">
                                    <span className="font-medium">{selectedCMS.charAt(0).toUpperCase() + selectedCMS.slice(1)} Instructions:</span>
                                  </div>
                                  <p className="text-purple-700 text-sm">{step.cms[selectedCMS]}</p>
                                </div>
                              )}

                              {/* Code Example */}
                              {step.codeExample && selectedCMS === 'code' && (
                                <div className="space-y-4">
                                  {step.codeExample.before && (
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <h5 className="text-sm font-medium text-red-700">❌ Before (Don't do this)</h5>
                                        <button
                                          onClick={() => copyCode(step.codeExample!.before!, `before-${step.id}`)}
                                          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                        >
                                          {copiedCode === `before-${step.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                          Copy
                                        </button>
                                      </div>
                                      <pre className="bg-red-50 border border-red-200 rounded p-3 text-xs overflow-x-auto">
                                        <code>{step.codeExample.before}</code>
                                      </pre>
                                    </div>
                                  )}

                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="text-sm font-medium text-green-700">
                                        ✅ {step.codeExample.before ? 'After (Do this instead)' : 'Implementation'}
                                      </h5>
                                      <button
                                        onClick={() => copyCode(step.codeExample!.after, `after-${step.id}`)}
                                        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                      >
                                        {copiedCode === `after-${step.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        Copy
                                      </button>
                                    </div>
                                    <pre className="bg-green-50 border border-green-200 rounded p-3 text-xs overflow-x-auto">
                                      <code>{step.codeExample.after}</code>
                                    </pre>
                                  </div>

                                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                    <div className="flex items-center gap-2 text-blue-800 text-sm mb-1">
                                      <Code2 className="w-4 h-4" />
                                      <span className="font-medium">Explanation:</span>
                                    </div>
                                    <p className="text-blue-700 text-sm">{step.codeExample.explanation}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Common Mistakes */}
                {guideData.commonMistakes && guideData.commonMistakes.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 text-lg mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      Common Mistakes to Avoid
                    </h3>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <ul className="space-y-2">
                        {guideData.commonMistakes.map((mistake: string, index: number) => (
                          <li key={index} className="text-orange-800 text-sm flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            {mistake}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Resources */}
                {guideData.resources && guideData.resources.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 text-lg mb-3">Additional Resources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {guideData.resources.map((resource: any, index: number) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{resource.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{resource.description}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Implementation guide not available for this check.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}