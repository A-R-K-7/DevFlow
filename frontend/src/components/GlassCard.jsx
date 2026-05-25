import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable Frosted-Glass Card Component.
 * Supports framer-motion hover effects.
 */
export default function GlassCard({ children, className = '', hoverEffect = true, onClick }) {
  const cardContent = (
    <div 
      onClick={onClick}
      className={`glass-panel p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );

  if (hoverEffect) {
    return (
      <motion.div
        whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
        className="w-full"
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}
