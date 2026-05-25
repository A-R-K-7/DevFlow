import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal } from 'lucide-react';

/**
 * Frosted-glass terminal modal dialog that displays live build logs.
 */
export default function LogModal({ isOpen, onClose, title = 'Terminal Logs', logs = [] }) {
  const terminalEndRef = useRef(null);

  // Auto-scroll logs to bottom on update
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Clean log parser to colorize lines depending on context
  const parseLogLine = (line, idx) => {
    let textClass = 'text-slate-300';
    if (line.includes('[SUCCESS]') || line.includes('SUCCESSFUL')) textClass = 'text-accent-emerald';
    else if (line.includes('[FAILED]') || line.includes('ERROR') || line.includes('Exception')) textClass = 'text-accent-rose';
    else if (line.includes('[PENDING]') || line.includes('Initializing')) textClass = 'text-text-muted';
    else if (line.includes('[COMPILING]') || line.includes('Testing') || line.includes('[RUNNING]')) textClass = 'text-accent-cyan';

    return (
      <div key={idx} className="font-mono text-xs leading-relaxed py-0.5">
        <span className={`${textClass}`}>{line}</span>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Terminal Window Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-3xl glass-panel bg-black/90 p-0 overflow-hidden border border-white/[0.08]"
          >
            {/* Console Window Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-[#0a0a0a] border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-accent-rose/70" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/70" />
                  <span className="w-3 h-3 rounded-full bg-accent-emerald/70" />
                </div>
                <div className="flex items-center gap-1.5 ml-4 text-text-secondary text-xs font-mono font-medium">
                  <Terminal size={12} />
                  <span>{title}</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-text-muted hover:text-white p-1 hover:bg-white/[0.05] rounded-lg transition-all duration-200"
              >
                <X size={15} />
              </button>
            </div>

            {/* Console Logs Stream Body */}
            <div className="p-6 h-[400px] overflow-y-auto bg-black/40 flex flex-col gap-1 select-text">
              {logs.length > 0 ? (
                logs.map((line, idx) => parseLogLine(line, idx))
              ) : (
                <div className="text-text-muted font-mono text-xs italic">// Console stream empty. Standing by.</div>
              )}
              <div ref={terminalEndRef} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
