import React from 'react';

const TacticalMap: React.FC = () => {
  return (
    <div className="bg-black/50 border border-border rounded-lg overflow-hidden relative w-full aspect-[16/9] lg:aspect-auto lg:h-[220px]">
      <svg className="w-full h-full block" viewBox="0 0 380 220" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Map Background */}
        <rect width="380" height="220" fill="#02080c" />

        {/* Terrain Shapes (Abstract) */}
        <path d="M50,200 Q150,150 250,200 T380,180 V220 H0 V200 Z" fill="rgba(0,40,20,.3)" />
        <path d="M220,100 Q280,50 340,120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
        
        {/* Grid Lines */}
        {[55, 110, 165].map(y => (
          <line key={`h-${y}`} x1="0" y1={y} x2="380" y2={y} stroke="rgba(0,229,255,.07)" strokeWidth="1"/>
        ))}
        {[95, 190, 285].map(x => (
          <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="220" stroke="rgba(0,229,255,.07)" strokeWidth="1"/>
        ))}

        {/* Route Path: Timika (Left/Bot) -> Wamena (Mid) -> Ilaga (Top/Right) */}
        <polyline points="60,180 200,100 320,60" fill="none" stroke="var(--dim)" strokeWidth="1" strokeDasharray="4,4" />
        
        {/* Active Leg Animation */}
        <circle r="3" fill="var(--accent)" filter="url(#glow)">
          <animateMotion dur="6s" repeatCount="indefinite" path="M60,180 L200,100 L320,60" keyPoints="0;0.5;1" keyTimes="0;0.5;1" calcMode="linear" />
        </circle>

        {/* Timika */}
        <circle cx="60" cy="180" r="4" fill="var(--accent)" filter="url(#glow)"/>
        <text x="60" y="195" fill="var(--accent)" fontSize="9" fontFamily="Share Tech Mono" letterSpacing="1" textAnchor="middle">TIMIKA (HQ)</text>

        {/* Wamena */}
        <circle cx="200" cy="100" r="4" fill="var(--yellow)" filter="url(#glow)"/>
        <text x="200" y="115" fill="var(--yellow)" fontSize="9" fontFamily="Share Tech Mono" letterSpacing="1" textAnchor="middle">WAMENA</text>
        <text x="200" y="90" fill="var(--text-lo)" fontSize="7" fontFamily="Share Tech Mono" textAnchor="middle">STOP 1</text>

        {/* Ilaga */}
        <circle cx="320" cy="60" r="4" fill="var(--red)" filter="url(#glow)"/>
        <text x="320" y="50" fill="var(--red)" fontSize="9" fontFamily="Share Tech Mono" letterSpacing="1" textAnchor="middle">ILAGA</text>
        <text x="320" y="75" fill="var(--red)" fontSize="7" fontFamily="Share Tech Mono" textAnchor="middle">HIGH ALT</text>

        {/* Weather Warning Icon near Ilaga */}
        <text x="290" y="50" fill="var(--yellow)" fontSize="10">⚠️</text>

        {/* Compass */}
        <g transform="translate(340, 28)">
            <text x="0" y="0" fill="rgba(0,229,255,.4)" fontSize="8" fontFamily="Share Tech Mono" textAnchor="middle">N</text>
            <line x1="0" y1="2" x2="0" y2="14" stroke="rgba(0,229,255,.3)" strokeWidth="1"/>
            <text x="0" y="22" fill="rgba(0,229,255,.3)" fontSize="6" fontFamily="Share Tech Mono" textAnchor="middle">↑</text>
        </g>
      </svg>
    </div>
  );
};

export default TacticalMap;