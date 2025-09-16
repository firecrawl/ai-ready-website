"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface MetricBarsProps {
  metrics: {
    label: string;
    score: number;
    status: 'pass' | 'warning' | 'fail';
    category?: 'page' | 'domain' | 'ai';
    details?: string;
    recommendation?: string;
    actionItems?: string[];
  }[];
}

export default function MetricBars({ metrics }: MetricBarsProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  const getBarColor = (score: number) => {
    // Use brand red colors with opacity for gradient effect
    if (score >= 80) return 'bg-heat-100';
    if (score >= 60) return 'bg-heat-90';
    if (score >= 40) return 'bg-heat-40 opacity-80';
    return 'bg-heat-20';
  };
  
  const getBulletColor = (score: number) => {
    // Always use heat-100 for all bullets for consistency
    return 'bg-heat-100';
  };
  
  const toggleExpanded = (label: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedItems(newExpanded);
  };
  
  // Sort metrics by score descending
  const sortedMetrics = [...metrics].sort((a, b) => b.score - a.score);
  
  return (
    <div className="space-y-8 max-w-[800px] mx-auto">
      {sortedMetrics.map((metric, index) => {
        const isExpanded = expandedItems.has(metric.label);
        
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="space-y-0"
          >
            <div 
              className={`grid grid-cols-12 gap-4 items-center p-8 -m-8 rounded-8 cursor-pointer transition-all hover:bg-black-alpha-2 ${
                isExpanded ? 'bg-black-alpha-4' : ''
              }`}
              onClick={() => toggleExpanded(metric.label)}
            >
              {/* Bullet and Label - fixed width */}
              <div className="col-span-4 flex items-center gap-8">
                <div className={`w-6 h-6 rounded-full ${getBulletColor(metric.score)}`} />
                <span className="text-label-medium text-accent-black truncate">{metric.label}</span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-auto"
                >
                  <ChevronDown className="w-16 h-16 text-black-alpha-32" />
                </motion.div>
              </div>
              
              {/* Bar container - flexible width */}
              <div className="col-span-7 relative">
                <div className="relative h-8 bg-black-alpha-8 rounded-full overflow-hidden">
                  {/* Animated bar */}
                  <motion.div
                    className={`absolute inset-y-0 left-0 ${getBarColor(metric.score)} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(metric.score, 2)}%` }}
                    transition={{ 
                      delay: 0.2 + index * 0.05, 
                      duration: 0.8,
                      ease: "easeOut"
                    }}
                  >
                    {/* Subtle inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-10 rounded-full" />
                  </motion.div>
                  
                  {/* Score indicator lines at key thresholds */}
                  {[40, 60, 80].map(threshold => (
                    <div
                      key={threshold}
                      className="absolute top-0 bottom-0 w-px bg-black-alpha-8 opacity-30"
                      style={{ left: `${threshold}%` }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Score value - fixed width */}
              <div className="col-span-1 text-right">
                <span className="text-label-medium font-medium text-heat-100">
                  {metric.score}%
                </span>
              </div>
            </div>
            
            {/* Expanded Details */}
            <AnimatePresence>
              {isExpanded && metric.details && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pl-54 pr-12 py-12 space-y-8">
                    <div>
                      <div className="text-label-small text-black-alpha-48 mb-4">Status</div>
                      <div className="text-body-small text-accent-black">{metric.details}</div>
                    </div>
                    {metric.recommendation && (
                      <div>
                        <div className="text-label-small text-black-alpha-48 mb-4">Recommendation</div>
                        <div className="text-body-small text-black-alpha-64">{metric.recommendation}</div>
                      </div>
                    )}
                    {metric.actionItems && metric.actionItems.length > 0 && (
                      <div>
                        <div className="text-label-small text-black-alpha-48 mb-4">Action Items</div>
                        <ul className="space-y-4">
                          {metric.actionItems.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-6 text-body-small text-black-alpha-64">
                              <span className="text-heat-100 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
      
      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-20 pt-12 border-t border-black-alpha-8"
      >
        <div className="grid grid-cols-3 gap-16 text-center">
          <div>
            <div className="text-title-h3 text-heat-150">
              {metrics.filter(m => m.status === 'pass').length}
            </div>
            <div className="text-label-small text-black-alpha-48">Passing</div>
          </div>
          <div>
            <div className="text-title-h3 text-heat-100">
              {metrics.filter(m => m.status === 'warning').length}
            </div>
            <div className="text-label-small text-black-alpha-48">Warning</div>
          </div>
          <div>
            <div className="text-title-h3 text-heat-50">
              {metrics.filter(m => m.status === 'fail').length}
            </div>
            <div className="text-label-small text-black-alpha-48">Failing</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}