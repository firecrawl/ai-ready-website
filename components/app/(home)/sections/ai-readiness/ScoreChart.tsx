"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ScoreChartProps {
  score: number;
  enhanced?: boolean;
  size?: number;
}

export default function ScoreChart({ score, enhanced = false, size = 200 }: ScoreChartProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  // Calculate stroke dash offset for the progress
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  
  // Determine color based on score
  const getColor = () => {
    if (score >= 80) return "#FF4A00"; // heat-200 - Excellent
    if (score >= 60) return "#FF6500"; // heat-150 - Good
    if (score >= 40) return "#FF8533"; // heat-100 - Warning
    return "#FFA566"; // heat-50 - Poor
  };
  
  const getGradientId = enhanced ? "enhanced-gradient" : "normal-gradient";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={getGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={getColor()} stopOpacity="1" />
            <stop offset="100%" stopColor={enhanced ? "#FF8533" : getColor()} stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.05)"
          strokeWidth="12"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${getGradientId})`}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          filter="url(#glow)"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className="text-4xl font-bold text-heat-150"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {animatedScore}%
        </motion.div>
        {enhanced && (
          <motion.div
            className="text-xs text-heat-100 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            AI Enhanced
          </motion.div>
        )}
      </div>
    </div>
  );
}