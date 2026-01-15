'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BrainCircuit, ShieldCheck, Zap, Database } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-black text-white selection:bg-brand-orange selection:text-black">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-brand-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="text-brand-orange w-6 h-6" />
            <span className="font-serif font-bold text-xl tracking-wide">CREA</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="#manifesto" className="text-sm text-gray-400 hover:text-white transition-colors">Manifesto</Link>
            <Link href="#engine" className="text-sm text-gray-400 hover:text-white transition-colors">The Engine</Link>
            <Link href="/login" className="bg-brand-orange text-brand-black px-4 py-2 rounded text-sm font-bold hover:bg-white transition-colors">
              Enter Gateway
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 space-y-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-serif leading-none">
              <span className="text-white">The Anti-</span><br />
              <span className="text-brand-orange">Hallucination</span><br />
              <span className="text-white">Chief of Staff.</span>
            </h1>
          </motion.div>

          <p className="text-xl text-gray-400 max-w-lg font-sans leading-relaxed">
            Most AI assistants guess. CREA knows.
            Built on a rigid architecture of <span className="text-brand-mint">Grounded Truth</span> and
            <span className="text-brand-orange"> Strategic Context</span>.
          </p>

          <div className="flex space-x-4">
            <Link href="/dashboard" className="bg-white text-brand-black px-8 py-4 rounded text-lg font-bold hover:bg-brand-mint transition-colors">
              Start Operations
            </Link>
          </div>
        </div>

        {/* Simulator / Visual */}
        <div className="md:w-1/2 mt-12 md:mt-0 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/20 rounded-full blur-[100px]" />
          <div className="relative bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm max-w-md mx-auto">
            <div className="flex items-center space-x-2 mb-4 border-b border-white/10 pb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-gray-500 font-mono">CREA_CORE_V2.0 // GROUNDED_MODE</span>
            </div>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex gap-3">
                <span className="text-gray-500">USER:</span>
                <span className="text-white">What's the status of Project Alpha?</span>
              </div>
              <div className="flex gap-3">
                <span className="text-brand-orange">CREA:</span>
                <div className="text-brand-mint">
                  <span className="opacity-50 text-xs block mb-1">[SEARCHING TABLES: PROJECTS, TASKS]</span>
                  Project Alpha is <span className="text-white font-bold">Active</span>.
                  <br />Deadline: 14 days remaining.
                  <br />Blocker: Pending API Key from Client.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals / Buckets */}
      <section id="engine" className="py-20 bg-white/5 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-serif text-center mb-16"><span className="text-brand-orange">The 7-Bucket</span> Architecture</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-white/10 rounded-lg hover:border-brand-mint transition-colors group">
              <Database className="w-10 h-10 text-brand-mint mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-4">Grounded SQL State</h3>
              <p className="text-gray-400">Tasks, Projects, and Decisions are stored in strict PostgreSQL tables. Zero ambiguity.</p>
            </div>
            <div className="p-8 border border-white/10 rounded-lg hover:border-brand-orange transition-colors group">
              <BrainCircuit className="w-10 h-10 text-brand-orange mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-4">Vector Memory</h3>
              <p className="text-gray-400">Unstructured thoughts and preferences are stored as embeddings, retrieved only when contextually relevant.</p>
            </div>
            <div className="p-8 border border-white/10 rounded-lg hover:border-white transition-colors group">
              <ShieldCheck className="w-10 h-10 text-white mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-4">Confidence Gating</h3>
              <p className="text-gray-400">If evidence is missing, CREA says "I don't know." No guessing. No hallucinations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 px-6 text-center text-gray-500 text-sm font-mono">
        SYSTEM STATUS: NORMAL // <span className="text-green-500">OPERATIONAL</span>
        <br />
        &copy; 2026 CREA INTELLIGENCE.
      </footer>
    </div>
  );
}
