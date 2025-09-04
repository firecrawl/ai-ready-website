"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X, FileText, Globe, Code, Sparkles, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface InlineResultsProps {
  isAnalyzing: boolean;
  showResults: boolean;
  analysisStep: number;
  url: string;
  onReset: () => void;
}

const analysisSteps = [
  "Fetching website content...",
  "Checking for LLMs.txt...",
  "Analyzing HTML structure...",
  "Calculating AI readiness...",
];

// Placeholder data for the results
const mockResults = {
  score: 78,
  grade: "B+",
  llmsTxt: true,
  robotsTxt: true,
  structuredData: true,
  semanticHTML: false,
  metaTags: true,
  accessibility: true,
};

export default function InlineResults({
  isAnalyzing,
  showResults,
  analysisStep,
  onReset,
}: InlineResultsProps) {
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    if (showResults) {
      // Animate score counting up
      const target = mockResults.score;
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
  }, [showResults]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#eab308";
    return "#ef4444";
  };

  return (
    <AnimatePresence mode="wait">
      {/* Analyzing State */}
      {isAnalyzing && (
        <motion.div
          key="analyzing"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-20"
        >
          {/* Progress Bar */}
          <div className="relative">
            <div className="h-2 bg-black-alpha-4 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-heat-100 to-heat-200"
                initial={{ width: "0%" }}
                animate={{ width: `${((analysisStep + 1) / 4) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            
            {/* Glowing dot at the end of progress */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-heat-100 rounded-full"
              style={{ 
                left: `${((analysisStep + 1) / 4) * 100}%`,
                boxShadow: "0 0 20px rgba(255, 77, 0, 0.8)",
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
            className="flex items-center gap-8 text-body-medium text-black-alpha-64"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-16 h-16 text-heat-100" />
            </motion.div>
            {analysisSteps[analysisStep]}
          </motion.div>
          
          {/* ASCII Animation */}
          <motion.div
            className="font-mono text-xs text-black-alpha-16 overflow-hidden h-32 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {'< analyzing />'}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Results State */}
      {showResults && (
        <motion.div
          key="results"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-24"
        >
          {/* Score Display */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                delay: 0.2 
              }}
              className="relative inline-block"
            >
              {/* Background glow */}
              <motion.div
                className="absolute inset-0 rounded-full blur-xl"
                style={{ background: getScoreColor(mockResults.score) }}
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              
              {/* Score circle */}
              <div 
                className="relative w-120 h-120 rounded-full flex flex-col items-center justify-center"
                style={{ 
                  background: `conic-gradient(from 0deg, ${getScoreColor(mockResults.score)} ${displayScore * 3.6}deg, #f0f0f0 ${displayScore * 3.6}deg)`,
                  padding: "4px",
                }}
              >
                <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl font-bold"
                    style={{ color: getScoreColor(mockResults.score) }}
                  >
                    {displayScore}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-label-medium text-black-alpha-48"
                  >
                    AI Ready
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Quick Checks Grid */}
          <motion.div 
            className="grid grid-cols-3 gap-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[
              { 
                label: "LLMs.txt", 
                value: mockResults.llmsTxt, 
                icon: FileText,
                description: "AI instructions",
                detail: mockResults.llmsTxt ? "Found" : "Missing"
              },
              { 
                label: "Structured Data", 
                value: mockResults.structuredData, 
                icon: Code,
                description: "Schema markup",
                detail: mockResults.structuredData ? "Detected" : "Not found"
              },
              { 
                label: "Semantic HTML", 
                value: mockResults.semanticHTML, 
                icon: Globe,
                description: "HTML5 tags",
                detail: mockResults.semanticHTML ? "Good" : "Needs work"
              },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className={`
                  relative p-16 rounded-12 transition-all hover:shadow-md cursor-pointer
                  ${item.value 
                    ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200' 
                    : 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200'}
                  border
                `}
              >
                {/* Status indicator */}
                <div className="absolute top-12 right-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + index * 0.1, type: "spring" }}
                    className={`
                      w-24 h-24 rounded-full flex items-center justify-center
                      ${item.value ? 'bg-green-500' : 'bg-red-500'}
                    `}
                  >
                    {item.value ? (
                      <Check className="w-14 h-14 text-white" strokeWidth={3} />
                    ) : (
                      <X className="w-14 h-14 text-white" strokeWidth={3} />
                    )}
                  </motion.div>
                </div>
                
                {/* Icon */}
                <div className="mb-12">
                  <item.icon className={`
                    w-24 h-24
                    ${item.value ? 'text-green-600' : 'text-red-600'}
                  `} />
                </div>
                
                {/* Content */}
                <div className="space-y-4">
                  <div className="text-label-medium text-accent-black">
                    {item.label}
                  </div>
                  <div className="text-body-small text-black-alpha-48">
                    {item.description}
                  </div>
                  <div className={`
                    text-label-small font-semibold
                    ${item.value ? 'text-green-600' : 'text-red-600'}
                  `}>
                    {item.detail}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Quick Tip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="p-12 bg-heat-4 rounded-8 border border-heat-100 flex items-start gap-8"
          >
            <AlertCircle className="w-16 h-16 text-heat-100 mt-2" />
            <div className="flex-1">
              <div className="text-label-medium text-accent-black mb-4">Quick Tip</div>
              <div className="text-body-small text-black-alpha-64">
                {mockResults.semanticHTML 
                  ? "Your site has good semantic HTML structure for AI understanding."
                  : "Add semantic HTML5 elements to improve AI comprehension of your content."}
              </div>
            </div>
          </motion.div>
          
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="flex gap-8"
          >
            <button
              onClick={onReset}
              className="flex-1 px-16 py-10 bg-black-alpha-4 hover:bg-black-alpha-6 rounded-8 text-label-medium transition-all"
            >
              Try Another
            </button>
            <button className="flex-1 px-16 py-10 bg-heat-100 hover:bg-heat-200 text-white rounded-8 text-label-medium transition-all shadow-lg hover:shadow-xl">
              View Details
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}