'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ExternalLink, Download, Check, Loader2 } from 'lucide-react';

interface Formula {
  name: string;
  full_name: string;
  desc: string;
  license: string;
  homepage: string;
  versions: {
    stable: string;
    head: string | null;
  };
  dependencies: string[];
}

export default function Directory() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
      setResults([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;

    const fetchResults = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await fetch(`/api/formulae?q=${encodeURIComponent(debouncedQuery)}&limit=48&page=${page}`);
        const data = await res.json();
        
        if (active) {
          if (page === 1) {
            setResults(data.data);
          } else {
            setResults(prev => [...prev, ...data.data]);
          }
          setHasMore(data.data.length === 48); // limit is 48
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    fetchResults();

    return () => { active = false; };
  }, [debouncedQuery, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          setPage(p => p + 1);
        }
      },
      { rootMargin: "100px" }
    );

    const currentLoaderNode = loaderRef.current;
    if (currentLoaderNode) {
      observer.observe(currentLoaderNode);
    }
    
    return () => {
      if (currentLoaderNode) observer.unobserve(currentLoaderNode);
    };
  }, [hasMore, loading, loadingMore]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black pb-24">
      <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32">
        {/* Header Section */}
        <header className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-medium tracking-tight mb-8 leading-[1.1]">
              Homebrew <br />
              <span className="text-white/30">Directory</span>
            </h1>
            <p className="font-sans text-lg sm:text-xl text-white/50 max-w-2xl leading-relaxed">
              Explore, search, and discover over 7,000 macOS packages. 
              The premium grid directory built for developers who care about their tools.
            </p>
          </motion.div>
        </header>

        {/* Search Input */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-3xl mb-20 group"
        >
          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-white/30 group-focus-within:text-white transition-colors duration-500" />
          </div>
          <input
            type="text"
            placeholder="Search formulae (e.g., wget, node, python)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-b border-white/10 py-6 pl-14 pr-6 text-2xl sm:text-3xl font-sans font-light text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors duration-500 rounded-none mix-blend-screen"
          />
        </motion.div>

        {/* Masonry Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {loading && results.length === 0 ? (
              // Skeletons
              Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="break-inside-avoid rounded-2xl bg-[#0A0A0A] border border-white/5 p-8 animate-pulse h-56"
                />
              ))
            ) : results.length > 0 ? (
              results.map((formula, index) => (
                <FormulaCard key={formula.name} formula={formula} index={index} />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-32 text-left sm:text-center"
              >
                <h3 className="text-3xl font-display font-medium text-white/80 mb-4">No results found</h3>
                <p className="text-white/40 font-sans text-lg">We couldn't find any packages matching "{query}"</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Infinite Scroll Loader */}
        {results.length > 0 && (
          <div ref={loaderRef} className="w-full mt-16 py-10 flex flex-col items-center justify-center">
            {hasMore ? (
              <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
            ) : (
              <p className="text-white/30 font-sans text-sm text-center">You've reached the end of the directory.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FormulaCard({ formula, index }: { formula: Formula; index: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`brew install ${formula.name}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.4), ease: [0.16, 1, 0.3, 1] }}
      layout
      className="break-inside-avoid group flex flex-col rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-white/20 hover:bg-[#0D0D0D] transition-all duration-500 overflow-hidden min-h-[240px] p-6 sm:p-8"
    >
      <div className="flex items-start justify-between mb-8">
        <h3 className="font-display font-medium text-2xl text-white/90 tracking-tight group-hover:text-white transition-colors duration-300">
          {formula.name}
        </h3>
        <a 
          href={formula.homepage} 
          target="_blank" 
          rel="noreferrer"
          className="text-white/20 hover:text-white transition-colors duration-300 ml-4 flex-shrink-0"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
      
      <p className="font-sans text-sm sm:text-base text-white/50 leading-relaxed mb-10 flex-grow">
        {formula.desc || "No description provided."}
      </p>

      <div className="mt-auto space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          {formula.versions.stable && (
            <span className="px-2.5 py-1 bg-white/5 text-white/70 font-mono text-xs tracking-wide rounded border border-white/[0.03]">
              v{formula.versions.stable}
            </span>
          )}
          {formula.license && (
            <span className="px-2.5 py-1 bg-white/5 text-white/70 font-mono text-xs tracking-wide rounded border border-white/[0.03] truncate max-w-[120px]">
              {formula.license}
            </span>
          )}
        </div>
        
        <div className="pt-6 border-t border-white/5 flex items-center justify-between group-hover:border-white/10 transition-colors duration-500">
          <code className="font-mono text-xs sm:text-sm text-white/40 group-hover:text-white/60 transition-colors duration-300 truncate mr-4">
            brew install {formula.name}
          </code>
          <button 
            onClick={handleCopy}
            className="text-white/30 hover:text-white transition-colors duration-300"
            title="Copy command"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check className="w-5 h-5 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Download className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
