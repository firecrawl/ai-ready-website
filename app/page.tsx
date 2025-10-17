"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import shared components
import { Connector } from "@/components/shared/layout/curvy-rect";
import HeroFlame from "@/components/shared/effects/flame/hero-flame";
import AsciiExplosion from "@/components/shared/effects/flame/ascii-explosion";
import { HeaderProvider } from "@/components/shared/header/HeaderContext";
import PasswordProtection from "@/components/shared/password-protection";

// Import hero section components
import HomeHeroBackground from "@/components/app/(home)/sections/hero/Background/Background";
import { BackgroundOuterPiece } from "@/components/app/(home)/sections/hero/Background/BackgroundOuterPiece";
import HomeHeroBadge from "@/components/app/(home)/sections/hero/Badge/Badge";
import HomeHeroPixi from "@/components/app/(home)/sections/hero/Pixi/Pixi";
import HomeHeroTitle from "@/components/app/(home)/sections/hero/Title/Title";
import HeroInputSubmitButton from "@/components/app/(home)/sections/hero-input/Button/Button";
import Globe from "@/components/app/(home)/sections/hero-input/_svg/Globe";
import HeroScraping from "@/components/app/(home)/sections/hero-scraping/HeroScraping";
import { Endpoint } from "@/components/shared/Playground/Context/types";
import ControlPanel from "@/components/app/(home)/sections/ai-readiness/ControlPanel";

// Import header components
import HeaderBrandKit from "@/components/shared/header/BrandKit/BrandKit";
import HeaderWrapper from "@/components/shared/header/Wrapper/Wrapper";
import HeaderDropdownWrapper from "@/components/shared/header/Dropdown/Wrapper/Wrapper";

export default function StyleGuidePage() {
  const [tab, setTab] = useState<Endpoint>(Endpoint.Scrape);
  const [url, setUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [urlError, setUrlError] = useState<string>("");
  
  // Check for API keys on mount
  useEffect(() => {
    fetch('/api/check-config')
      .then(res => res.json())
      .then(data => {
        setHasOpenAIKey(data.hasOpenAIKey || false);
      })
      .catch(() => setHasOpenAIKey(false));
  }, []);
  
  const handleAnalysis = async () => {
    if (!url) return;
    
    // Auto-prepend https:// if no protocol is provided
    let processedUrl = url.trim();
    if (!processedUrl.match(/^https?:\/\//i)) {
      processedUrl = 'https://' + processedUrl;
    }
    
    // Validate URL format
    try {
      const urlObj = new URL(processedUrl);
      // Check if it's http or https
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        setUrlError('Please enter a valid URL (e.g., example.com)');
        return;
      }
    } catch (error) {
      // If URL constructor throws, it's not a valid URL
      setUrlError('Please enter a valid URL (e.g., example.com)');
      return;
    }
    
    setIsAnalyzing(true);
    setShowResults(false);
    setAnalysisData(null);
    
    try {
      // Start basic analysis
      const basicAnalysisPromise = fetch('/api/ai-readiness', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: processedUrl }),
      });
      
      // Disable automatic AI analysis for now - user will click button
      let aiAnalysisPromise = null;
      
      // Wait for basic analysis
      const response = await basicAnalysisPromise;
      const data = await response.json();
      
      if (data.success) {
        setAnalysisData({
          ...data,
          aiAnalysisPromise: null, // No auto AI analysis
          hasOpenAIKey: false, // Disable auto AI
          autoStartAI: false // Don't auto-start
        });
        setIsAnalyzing(false);
        setShowResults(true);
      } else {
        console.error('Analysis failed:', data.error);
        setIsAnalyzing(false);
        alert('Failed to analyze website. Please check the URL and try again.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      alert('An error occurred while analyzing the website.');
    }
  };

  return (
    <PasswordProtection>
      <HeaderProvider>
        <div className="min-h-screen bg-background-base">
        {/* Header/Navigation Section */}
        <HeaderDropdownWrapper />
        
        <div className="sticky top-0 left-0 w-full z-[101] bg-background-base header">
          <div className="absolute top-0 cmw-container border-x border-border-faint h-full pointer-events-none" />
          
          <div className="h-1 bg-border-faint w-full left-0 -bottom-1 absolute" />
          
          <div className="cmw-container absolute h-full pointer-events-none top-0">
            <Connector className="absolute -left-[10.5px] -bottom-11" />
            <Connector className="absolute -right-[10.5px] -bottom-11" />
          </div>
          
          <HeaderWrapper>
            <div className="max-w-[900px] mx-auto w-full flex justify-between items-center">
              <div className="flex gap-24 items-center">
                <HeaderBrandKit />
              </div>
              
              <div className="flex gap-8">
                {/* Removed GitHub link */}
              </div>
            </div>
          </HeaderWrapper>
        </div>

        {/* Hero Section */}
        <section className="overflow-x-clip" id="home-hero">
          <div className={`pt-28 lg:pt-254 lg:-mt-100 pb-115 relative ${isAnalyzing || showResults ? '' : ''}`} id="hero-content">
            <HomeHeroPixi />
            <HeroFlame />
            <BackgroundOuterPiece />
            <HomeHeroBackground />
            
            <AnimatePresence mode="wait">
              {!isAnalyzing && !showResults ? (
                <motion.div
                  key="hero"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="relative container px-16"
                >
                  <HomeHeroBadge />
                  <HomeHeroTitle />
                  
                  <p className="text-center text-body-large">
                    Analyze how AI-ready your webpage is from a single
                    <br className="lg-max:hidden" />
                    page snapshot. High-signal metrics for LLM compatibility.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="control-panel"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative container px-16"
                  style={{ marginTop: '-35px' }}
                >
                  <ControlPanel
                    isAnalyzing={isAnalyzing}
                    showResults={showResults}
                    url={url}
                    analysisData={analysisData}
                    onReset={() => {
                      setIsAnalyzing(false);
                      setShowResults(false);
                      setAnalysisStep(0);
                      setAnalysisData(null);
                      setUrl("");
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Mini Playground Input - Only show when not analyzing */}
          {!isAnalyzing && !showResults && (
            <motion.div 
              className="container lg:contents !p-16 relative -mt-90"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute top-0 left-[calc(50%-50vw)] w-screen h-1 bg-border-faint lg:hidden" />
              <div className="absolute bottom-0 left-[calc(50%-50vw)] w-screen h-1 bg-border-faint lg:hidden" />
              
              <Connector className="-top-10 -left-[10.5px] lg:hidden" />
              <Connector className="-top-10 -right-[10.5px] lg:hidden" />
              <Connector className="-bottom-10 -left-[10.5px] lg:hidden" />
              <Connector className="-bottom-10 -right-[10.5px] lg:hidden" />
              
              {/* Hero Input Component */}
              <div className="max-w-552 mx-auto w-full relative z-[11] lg:z-[2] rounded-20 -mt-30 lg:-mt-30">
                <div
                  className="overlay bg-accent-white"
                  style={{
                    boxShadow:
                      "0px 0px 44px 0px rgba(0, 0, 0, 0.02), 0px 88px 56px -20px rgba(0, 0, 0, 0.03), 0px 56px 56px -20px rgba(0, 0, 0, 0.02), 0px 32px 32px -20px rgba(0, 0, 0, 0.03), 0px 16px 24px -12px rgba(0, 0, 0, 0.03), 0px 0px 0px 1px rgba(0, 0, 0, 0.05), 0px 0px 0px 10px #F9F9F9",
                  }}
                />
                
                <div className="p-16 flex gap-12 items-center w-full relative">
                  <Globe />
                  
                  <input
                    className={`flex-1 bg-transparent text-body-input text-accent-black placeholder:text-black-alpha-48 focus:outline-none focus:ring-0 focus:border-transparent ${urlError ? 'text-heat-200' : ''}`}
                    placeholder="example.com"
                    type="text"
                    value={url}
                    onChange={(e) => {
                      const newUrl = e.target.value;
                      setUrl(newUrl);
                      // Clear error when user starts typing
                      if (urlError) setUrlError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && url.length > 0) {
                        e.preventDefault();
                        handleAnalysis();
                      }
                    }}
                  />
                  
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      if (url.length > 0) {
                        handleAnalysis();
                      }
                    }}
                  >
                    <HeroInputSubmitButton dirty={url.length > 0} tab={tab} />
                  </div>
                </div>
                
                {/* Error message */}
                {urlError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-24 left-16 text-heat-200 text-label-small"
                  >
                    {urlError}
                  </motion.div>
                )}
                
                <div className="h-248 top-84 cw-768 pointer-events-none absolute overflow-clip -z-10">
                  <AsciiExplosion className="-top-200" />
                </div>
              </div>
              
              {/* Hero Scraping Animation */}
              <HeroScraping />
            </motion.div>
          )}
        </section>
        </div>
      </HeaderProvider>
    </PasswordProtection>
  );
}