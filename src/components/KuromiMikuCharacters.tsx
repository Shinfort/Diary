"use client";

import React from 'react';

// Crisp, high-detail vector graphic of Sanrio Kuromi
export function KuromiIcon({ size = 52, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', filter: 'drop-shadow(0 2px 4px rgba(124, 58, 237, 0.25))' }}
    >
      <defs>
        <radialGradient id="kuromiHood" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#4c1d95" />
          <stop offset="65%" stopColor="#2e1065" />
          <stop offset="100%" stopColor="#1e0a3d" />
        </radialGradient>
        <radialGradient id="kuromiBlush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f472b6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pinkBall" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
      </defs>

      {/* Jester Ear - Left */}
      <path
        d="M 36 50 C 24 38 12 18 18 8 C 24 16 35 28 42 42 Z"
        fill="url(#kuromiHood)"
      />
      {/* Left Ear Tip Pink Bell */}
      <circle cx="16" cy="7" r="5" fill="url(#pinkBall)" />
      <circle cx="14.5" cy="5.5" r="1.5" fill="#ffffff" opacity="0.8" />

      {/* Jester Ear - Right */}
      <path
        d="M 84 50 C 96 38 108 18 102 8 C 96 16 85 28 78 42 Z"
        fill="url(#kuromiHood)"
      />
      {/* Right Ear Tip Pink Bell */}
      <circle cx="104" cy="7" r="5" fill="url(#pinkBall)" />
      <circle cx="102.5" cy="5.5" r="1.5" fill="#ffffff" opacity="0.8" />

      {/* Jester Hood Base Head */}
      <ellipse cx="60" cy="56" rx="36" ry="32" fill="url(#kuromiHood)" />

      {/* Jester Neck Collar Points (pointed bib with bells) */}
      <path
        d="M 38 82 L 32 95 L 44 88 L 60 97 L 76 88 L 88 95 L 82 82 Z"
        fill="#2e1065"
      />
      <circle cx="32" cy="95" r="3.5" fill="url(#pinkBall)" />
      <circle cx="60" cy="97" r="4" fill="url(#pinkBall)" />
      <circle cx="88" cy="95" r="3.5" fill="url(#pinkBall)" />

      {/* Face (Chibi white oval) */}
      <ellipse cx="60" cy="62" rx="27" ry="21" fill="#fffdfa" />

      {/* Forehead Hood Opening Arc */}
      <path
        d="M 33 60 C 33 44 45 42 60 42 C 75 42 87 44 87 60 C 87 52 75 47 60 47 C 45 47 33 52 33 60 Z"
        fill="#2e1065"
        opacity="0.3"
      />

      {/* Kuromi Forehead Pink Skull Emblem */}
      <g transform="translate(60, 36)">
        {/* Skull head */}
        <ellipse cx="0" cy="0" rx="7.5" ry="6.5" fill="#ec4899" />
        {/* Skull jaw */}
        <rect x="-4" y="3.5" width="8" height="3" rx="1.5" fill="#ec4899" />
        {/* Skull eye holes */}
        <circle cx="-3" cy="-0.5" r="1.8" fill="#2e1065" />
        <circle cx="3" cy="-0.5" r="1.8" fill="#2e1065" />
        {/* Skull little bones / ears */}
        <circle cx="-7.5" cy="-4" r="2" fill="#ec4899" />
        <circle cx="7.5" cy="-4" r="2" fill="#ec4899" />
      </g>

      {/* Left Eye */}
      <g>
        <ellipse cx="49" cy="61" rx="4" ry="5.5" fill="#2e1065" />
        {/* Eye Shine */}
        <circle cx="47.5" cy="59" r="1.8" fill="#ffffff" />
        <circle cx="50.5" cy="63" r="0.8" fill="#ffffff" />
        {/* Eyelash */}
        <path d="M 44 57 C 46 55 50 55 54 57" stroke="#2e1065" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M 43 56 L 41 53" stroke="#2e1065" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Right Eye */}
      <g>
        <ellipse cx="71" cy="61" rx="4" ry="5.5" fill="#2e1065" />
        {/* Eye Shine */}
        <circle cx="69.5" cy="59" r="1.8" fill="#ffffff" />
        <circle cx="72.5" cy="63" r="0.8" fill="#ffffff" />
        {/* Eyelash */}
        <path d="M 66 57 C 70 55 74 55 76 57" stroke="#2e1065" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M 77 56 L 79 53" stroke="#2e1065" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Blushing Cheeks */}
      <ellipse cx="42" cy="67" rx="5" ry="3" fill="url(#kuromiBlush)" />
      <ellipse cx="78" cy="67" rx="5" ry="3" fill="url(#kuromiBlush)" />

      {/* Nose */}
      <circle cx="60" cy="63.5" r="1" fill="#ec4899" />

      {/* Mischievous Cute Cat Smile */}
      <path
        d="M 55 67 C 57 69 59 69 60 67 C 61 69 63 69 65 67"
        stroke="#2e1065"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Crisp, high-detail vector graphic of Hatsune Miku
export function MikuIcon({ size = 52, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', filter: 'drop-shadow(0 2px 4px rgba(6, 182, 212, 0.25))' }}
    >
      <defs>
        {/* Miku Teal Hair Gradient */}
        <linearGradient id="mikuHair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="70%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        {/* Twin tails with purple-pink tip gradient for our theme blend */}
        <linearGradient id="mikuTwinTail" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="65%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
        {/* Pink hair ties */}
        <linearGradient id="mikuRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <radialGradient id="mikuBlush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Left Twin Tail */}
      <path
        d="M 32 46 C 18 52 8 74 12 104 C 15 95 24 82 28 72 C 30 62 31 52 32 46 Z"
        fill="url(#mikuTwinTail)"
      />
      {/* Left Hair Tie (Iconic Cube/Ribbon) */}
      <rect x="25" y="42" width="10" height="9" rx="2.5" fill="#18181b" />
      <rect x="27" y="44" width="6" height="5" rx="1.5" fill="url(#mikuRibbon)" />

      {/* Right Twin Tail */}
      <path
        d="M 88 46 C 102 52 112 74 108 104 C 105 95 96 82 92 72 C 90 62 89 52 88 46 Z"
        fill="url(#mikuTwinTail)"
      />
      {/* Right Hair Tie */}
      <rect x="85" y="42" width="10" height="9" rx="2.5" fill="#18181b" />
      <rect x="87" y="44" width="6" height="5" rx="1.5" fill="url(#mikuRibbon)" />

      {/* Head Back Base */}
      <ellipse cx="60" cy="54" rx="26" ry="24" fill="url(#mikuHair)" />

      {/* Chibi Face */}
      <ellipse cx="60" cy="58" rx="23" ry="20" fill="#fff8f5" />

      {/* Cyber Headset (Left side) */}
      <rect x="33" y="48" width="6" height="15" rx="3" fill="#27272a" />
      <rect x="34.5" y="52" width="3" height="7" rx="1.5" fill="#ec4899" />
      {/* Headset Mic Bar */}
      <path d="M 36 60 Q 42 66 48 66" stroke="#27272a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="48" cy="66" r="2" fill="#ec4899" />

      {/* Headset (Right side indicator) */}
      <rect x="81" y="48" width="6" height="15" rx="3" fill="#27272a" />
      <rect x="82.5" y="52" width="3" height="7" rx="1.5" fill="#ec4899" />

      {/* Hair Bangs (Fringe) */}
      <path
        d="M 37 48 C 42 54 48 57 52 50 C 56 56 64 56 68 50 C 72 56 78 54 83 48 C 80 40 70 34 60 34 C 50 34 40 40 37 48 Z"
        fill="url(#mikuHair)"
      />
      {/* Hair Highlight Band */}
      <path
        d="M 42 42 Q 60 38 78 42"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Left Eye */}
      <g>
        <ellipse cx="49" cy="60" rx="4.5" ry="6" fill="#0891b2" />
        <ellipse cx="49" cy="62" rx="3.5" ry="4" fill="#0e7490" />
        {/* Eye Pupil / Sparkle */}
        <circle cx="47.5" cy="58" r="2" fill="#ffffff" />
        <circle cx="50.5" cy="63" r="1" fill="#a5f3fc" />
        {/* Eyelash */}
        <path d="M 43 56 C 46 53 51 53 55 56" stroke="#164e63" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* Right Eye */}
      <g>
        <ellipse cx="71" cy="60" rx="4.5" ry="6" fill="#0891b2" />
        <ellipse cx="71" cy="62" rx="3.5" ry="4" fill="#0e7490" />
        {/* Eye Pupil / Sparkle */}
        <circle cx="69.5" cy="58" r="2" fill="#ffffff" />
        <circle cx="72.5" cy="63" r="1" fill="#a5f3fc" />
        {/* Eyelash */}
        <path d="M 65 56 C 69 53 74 53 77 56" stroke="#164e63" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* Blushing Cheeks */}
      <ellipse cx="43" cy="67" rx="5" ry="3" fill="url(#mikuBlush)" />
      <ellipse cx="77" cy="67" rx="5" ry="3" fill="url(#mikuBlush)" />

      {/* Nose */}
      <circle cx="60" cy="63" r="0.8" fill="#f43f5e" opacity="0.6" />

      {/* Sweet Smile */}
      <path
        d="M 56 67 Q 60 71 64 67"
        stroke="#e11d48"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="#fecdd3"
      />

      {/* Floating Little Musical Note */}
      <g transform="translate(94, 26)">
        <ellipse cx="4" cy="10" rx="3" ry="2" fill="#ec4899" transform="rotate(-20 4 10)" />
        <rect x="5.5" y="2" width="1.5" height="9" fill="#ec4899" />
        <path d="M 7 2 Q 10 3 11 6" stroke="#ec4899" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// Combined cute duo badge
export function KuromiMikuDuoBadge({ size = 36 }: { size?: number }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
      <KuromiIcon size={size} />
      <span style={{ fontSize: `${size * 0.4}px`, color: '#ec4899', fontWeight: 'bold' }}>💖</span>
      <MikuIcon size={size} />
    </div>
  );
}
