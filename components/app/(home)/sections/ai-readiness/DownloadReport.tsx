"use client";

import { useState } from 'react';
import { Download, FileText, Database, Table } from 'lucide-react';
import { motion } from 'framer-motion';

interface DownloadReportProps {
  analysisData: any;
  isVisible: boolean;
}

// Mock data for demonstration when no real data is available (removed to avoid unused variable warning)
/*
const _getMockAnalysisData = () => ({
  url: "https://example.com",
  overallScore: 78,
  checks: [
    {
      id: 'heading-structure',
      label: 'Heading Hierarchy',
      status: 'pass' as const,
      score: 95,
      details: 'Perfect hierarchy with 1 H1 and logical structure',
      recommendation: 'Excellent heading structure for AI comprehension'
    },
    {
      id: 'readability',
      label: 'Content Readability',
      status: 'warning' as const,
      score: 65,
      details: 'Good readability (Flesch: 55)',
      recommendation: 'Simplify sentences and use clearer language for better AI comprehension'
    },
    {
      id: 'meta-tags',
      label: 'Metadata Quality',
      status: 'pass' as const,
      score: 85,
      details: 'Title ✓, Description ✓, Author ✓',
      recommendation: 'Metadata provides excellent context for AI'
    },
    {
      id: 'semantic-html',
      label: 'Semantic HTML',
      status: 'warning' as const,
      score: 60,
      details: 'Found 3 semantic HTML5 elements',
      recommendation: 'Use more semantic HTML5 elements (article, nav, main, section, etc.)'
    },
    {
      id: 'accessibility',
      label: 'Accessibility',
      status: 'fail' as const,
      score: 45,
      details: '60% images have alt text, ARIA labels: No',
      recommendation: 'Add alt text to all images and use ARIA labels for interactive elements'
    },
    {
      id: 'robots-txt',
      label: 'Robots.txt',
      status: 'pass' as const,
      score: 100,
      details: 'Robots.txt found with 1 sitemap reference(s)',
      recommendation: 'Robots.txt properly configured'
    },
    {
      id: 'sitemap',
      label: 'Sitemap',
      status: 'pass' as const,
      score: 100,
      details: 'Valid XML sitemap found (referenced in robots.txt)',
      recommendation: 'Sitemap is properly configured'
    },
    {
      id: 'llms-txt',
      label: 'LLMs.txt',
      status: 'fail' as const,
      score: 0,
      details: 'No llms.txt file found',
      recommendation: 'Add an llms.txt file to define AI usage permissions'
    }
  ],
  metadata: {
    title: "Example Website - AI Ready Analysis",
    description: "Comprehensive AI readiness analysis for example.com",
    analyzedAt: new Date().toISOString()
  }
*/

export default function DownloadReport({ analysisData, isVisible }: DownloadReportProps) {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const downloadReport = async (format: 'html' | 'json' | 'csv') => {
    if (!analysisData) return;
    
    setIsDownloading(format);
    
    try {
      const response = await fetch('/api/download-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisData,
          format
        }),
      });

      if (response.ok) {
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition?.match(/filename="([^"]+)"/)?.[1] || `ai-readiness-report.${format}`;
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        console.error('Download failed');
        alert('Failed to download report. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('An error occurred while downloading the report.');
    }
    
    setIsDownloading(null);
  };

  if (!isVisible || !analysisData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="bg-white rounded-16 border border-border-faint p-20 mb-16"
      style={{
        boxShadow: "0px 0px 44px 0px rgba(0, 0, 0, 0.02), 0px 88px 56px -20px rgba(0, 0, 0, 0.03)"
      }}
    >
      <div className="flex items-center gap-8 mb-12">
        <Download className="w-20 h-20 text-heat-200" />
        <h3 className="text-label-large font-medium text-accent-black">Download Report</h3>
      </div>
      
      <p className="text-body-small text-black-alpha-64 mb-16">
        Export your AI readiness analysis in different formats for sharing or further analysis.
      </p>
      
      <div className="flex flex-wrap gap-8">
        <button
          onClick={() => downloadReport('html')}
          disabled={isDownloading !== null}
          className={`flex items-center gap-6 px-12 py-8 text-label-small rounded-8 border transition-all ${
            isDownloading === 'html' 
              ? 'bg-black-alpha-4 text-black-alpha-48 cursor-not-allowed' 
              : 'bg-accent-white border-border-faint hover:bg-black-alpha-4 text-accent-black cursor-pointer'
          }`}
        >
          <FileText className="w-14 h-14" />
          {isDownloading === 'html' ? 'Downloading...' : 'HTML Report'}
        </button>
        
        <button
          onClick={() => downloadReport('json')}
          disabled={isDownloading !== null}
          className={`flex items-center gap-6 px-12 py-8 text-label-small rounded-8 border transition-all ${
            isDownloading === 'json' 
              ? 'bg-black-alpha-4 text-black-alpha-48 cursor-not-allowed' 
              : 'bg-accent-white border-border-faint hover:bg-black-alpha-4 text-accent-black cursor-pointer'
          }`}
        >
          <Database className="w-14 h-14" />
          {isDownloading === 'json' ? 'Downloading...' : 'JSON Data'}
        </button>
        
        <button
          onClick={() => downloadReport('csv')}
          disabled={isDownloading !== null}
          className={`flex items-center gap-6 px-12 py-8 text-label-small rounded-8 border transition-all ${
            isDownloading === 'csv' 
              ? 'bg-black-alpha-4 text-black-alpha-48 cursor-not-allowed' 
              : 'bg-accent-white border-border-faint hover:bg-black-alpha-4 text-accent-black cursor-pointer'
          }`}
        >
          <Table className="w-14 h-14" />
          {isDownloading === 'csv' ? 'Downloading...' : 'CSV Data'}
        </button>
      </div>
    </motion.div>
  );
}