/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Share2, Quote as QuoteIcon, Heart } from 'lucide-react';
import { generateDailyQuote, Quote } from './services/gemini';

export default function App() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchQuote = async () => {
    setIsRefreshing(true);
    try {
      const newQuote = await generateDailyQuote();
      setQuote(newQuote);
    } catch (error) {
      console.error("Failed to fetch quote", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  const handleShare = () => {
    if (quote) {
      const text = `"${quote.text}" - ${quote.author}\n\n오늘의 문구 추천 앱에서 확인하세요!`;
      if (navigator.share) {
        navigator.share({
          title: '오늘의 인생 문구',
          text: text,
          url: window.location.href,
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(text);
        alert('클립보드에 복사되었습니다!');
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 atmosphere z-0" />
      
      <main className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-xs uppercase tracking-[0.3em] font-medium text-emerald-400/80">Daily Inspiration</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight serif">오늘의 한 문장</h1>
        </motion.header>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <RefreshCw className="w-8 h-8 animate-spin text-white/20" />
              <p className="mt-4 text-sm text-white/40 font-light tracking-widest uppercase">생각을 담는 중...</p>
            </motion.div>
          ) : quote && (
            <motion.div
              key={quote.text}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full glass rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
              
              <QuoteIcon className="w-10 h-10 text-white/10 mb-8" />
              
              <div className="space-y-8">
                <h2 className="text-2xl md:text-3xl lg:text-4xl leading-relaxed serif font-light text-white/95">
                  {quote.text}
                </h2>
                
                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                  <div>
                    <p className="text-lg font-medium text-white/80">{quote.author}</p>
                    <p className="text-xs uppercase tracking-widest text-white/30 mt-1">{quote.category}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={handleShare}
                      className="p-3 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white/80"
                      title="공유하기"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button 
                      className="p-3 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white/80"
                      title="좋아요"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/5 rounded-2xl p-6 mt-8"
                >
                  <p className="text-sm leading-relaxed text-white/60 font-light italic">
                    {quote.explanation}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 flex flex-col items-center gap-6"
        >
          <button
            onClick={fetchQuote}
            disabled={isRefreshing}
            className="group relative flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isRefreshing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            )}
            새로운 문장 받기
          </button>
          
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-medium">
            Powered by Gemini AI
          </p>
        </motion.div>
      </main>

      <footer className="absolute bottom-8 text-[10px] text-white/10 tracking-widest uppercase">
        © 2026 Daily One Sentence. All rights reserved.
      </footer>
    </div>
  );
}
