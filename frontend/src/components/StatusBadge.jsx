import React from 'react';

/**
 * Status Pill with optional pulsing glows for active pipelines.
 */
export default function StatusBadge({ status }) {
  let badgeStyles = 'bg-white/[0.04] text-text-secondary border-white/[0.06]';
  let dotStyles = 'bg-text-muted';
  let hasPulse = false;

  switch (status) {
    case 'SUCCESS':
      badgeStyles = 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20';
      dotStyles = 'bg-accent-emerald shadow-emerald';
      break;
    case 'FAILED':
      badgeStyles = 'bg-accent-rose/10 text-accent-rose border-accent-rose/20';
      dotStyles = 'bg-accent-rose shadow-rose';
      break;
    case 'RUNNING':
      badgeStyles = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      dotStyles = 'bg-amber-500 animate-pulse';
      hasPulse = true;
      break;
    case 'PENDING':
      badgeStyles = 'bg-white/10 text-white border-white/20';
      dotStyles = 'bg-white';
      hasPulse = true;
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${badgeStyles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles} ${hasPulse ? 'animate-pulse-ring' : ''}`} />
      <span className="tracking-wide uppercase">{status}</span>
    </span>
  );
}
