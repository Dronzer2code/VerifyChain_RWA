import React from 'react';
// import { motion } from 'framer-motion';
import { Shield, ArrowRight, CheckCircle, Activity, Lock, Globe, ChevronRight, Play } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#0084FF] selection:text-white overflow-x-hidden">
      {/* Background Glow Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0084FF] rounded-full blur-[120px] opacity-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#10B981] rounded-full blur-[120px] opacity-5"></div>
      </div>

      {/* Global Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0084FF] rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Verifi<span className="text-[#0084FF]">chain</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Platform</a>
            <a href="#" className="hover:text-white transition-colors">Solutions</a>
            <a href="#" className="hover:text-white transition-colors">Developers</a>
            <a href="#" className="hover:text-white transition-colors">Company</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:block text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Login
            </button>
            <button 
              onClick={onGetStarted}
              className="bg-[#0084FF] hover:bg-[#0073e6] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-[0_0_20px_rgba(0,132,255,0.3)] hover:shadow-[0_0_30px_rgba(0,132,255,0.5)]"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Content */}
          <div 
            // initial={{ opacity: 0, y: 20 }}
            // animate={{ opacity: 1, y: 0 }}
            // transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0084FF]/10 border border-[#0084FF]/20 text-[#0084FF] text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#0084FF] animate-pulse"></span>
              Live on Mainnet
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
              Unlock Trust in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0084FF] to-[#00C2FF]">Tokenized</span> Bonds
            </h1>

            <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
              The world's first RWA verification layer. We bridge the gap between off-chain assets and on-chain liquidity with cryptographic certainty.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-[#0084FF] text-white rounded-lg font-bold text-lg hover:bg-[#0073e6] transition-all shadow-[0_0_20px_rgba(0,132,255,0.3)] flex items-center justify-center gap-2 group"
              >
                Verify Your Documents
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-[#1a1a1a] text-white border border-white/10 rounded-lg font-bold text-lg hover:bg-[#252525] transition-all flex items-center justify-center gap-2">
                <Play className="w-5 h-5 fill-current" />
                Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span>SOC2 Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span>Audited by Certik</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual */}
          <div 
            // initial={{ opacity: 0, scale: 0.95 }}
            // animate={{ opacity: 1, scale: 1 }}
            // transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Abstract 3D Building Representation */}
            <div className="relative w-full aspect-square bg-gradient-to-br from-[#111] to-[#050505] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
              
              {/* Floating Nodes */}
              <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-[#0084FF] rounded-full shadow-[0_0_15px_#0084FF]"></div>
              <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-[#10B981] rounded-full shadow-[0_0_15px_#10B981]"></div>
              <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_15px_#FBBF24]"></div>

              {/* Glassmorphism Overlay Card */}
              <div className="absolute bottom-10 left-10 right-10 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Current Yield (APY)</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">12.4%</span>
                      <span className="text-sm font-medium text-[#10B981] flex items-center">
                        <Activity className="w-3 h-3 mr-1" /> +2.1%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Next Payout</p>
                    <p className="text-xl font-mono text-white">04:12:59</p>
                  </div>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="w-[75%] h-full bg-gradient-to-r from-[#0084FF] to-[#00C2FF]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Metrics Bar */}
      <section className="border-y border-white/5 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center md:text-left">
              <p className="text-3xl font-bold text-white mb-1">$4.2B+</p>
              <p className="text-sm text-gray-500 uppercase tracking-wider">Total Value Verified</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-3xl font-bold text-white mb-1">120+</p>
              <p className="text-sm text-gray-500 uppercase tracking-wider">Active Bond Issuers</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-3xl font-bold text-white mb-1">15k+</p>
              <p className="text-sm text-gray-500 uppercase tracking-wider">Successful Audits</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-3xl font-bold text-[#10B981] mb-1">99.99%</p>
              <p className="text-sm text-gray-500 uppercase tracking-wider">System Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-24 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <span className="text-[#0084FF] font-bold tracking-wider uppercase text-sm mb-4 block">The Problem</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Traditional Bonds Fail <br />
              Retail Investors
            </h2>
            <p className="text-xl text-gray-400 leading-relaxed">
              Opaque settlement layers, high entry barriers, and lack of real-time transparency have kept high-yield real world assets out of reach. Verifichain changes that.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
