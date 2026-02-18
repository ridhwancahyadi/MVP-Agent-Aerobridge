import React from 'react';

const TacticalMap: React.FC = () => {
  return (
    <div className="bg-black/50 border border-border rounded-lg overflow-hidden relative w-full aspect-[16/9] lg:aspect-auto lg:h-[220px] shadow-inner group">
      <svg className="w-full h-full block" viewBox="0 0 380 220" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="wx" cx="55%" cy="42%" r="18%">
            <stop offset="0%" stopColor="#ff3333" stopOpacity=".35"/>
            <stop offset="60%" stopColor="#ff8800" stopOpacity=".15"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
          
          {/* Leg 1 Gradient: Blue (Timika) -> Yellow (Wamena) */}
          <linearGradient id="gradLeg1" x1="60" y1="180" x2="200" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--yellow)" />
          </linearGradient>

          {/* Leg 2 Gradient: Yellow (Wamena) -> Green (Ilaga) */}
          <linearGradient id="gradLeg2" x1="200" y1="100" x2="320" y2="60" gradientUnits="userSpaceOnUse">
             <stop offset="0%" stopColor="var(--yellow)" />
             <stop offset="100%" stopColor="var(--green)" />
          </linearGradient>

          {/* Deviation Gradient */}
          <linearGradient id="gradDev" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--text-hi)" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Map Background */}
        <rect width="380" height="220" fill="#02080c" />

        {/* Terrain Shapes (Papua Highlands Abstract) */}
        <ellipse cx="190" cy="130" rx="160" ry="60" fill="rgba(0,40,20,.4)" stroke="rgba(0,80,40,.3)" strokeWidth="1"/>
        <ellipse cx="240" cy="100" rx="80" ry="35" fill="rgba(0,30,15,.5)" stroke="rgba(0,60,30,.3)" strokeWidth="1"/>
        <ellipse cx="150" cy="150" rx="60" ry="25" fill="rgba(0,25,12,.4)"/>

        {/* Grid Lines */}
        {[55, 110, 165].map(y => (
          <line key={`h-${y}`} x1="0" y1={y} x2="380" y2={y} stroke="rgba(0,229,255,.07)" strokeWidth="1"/>
        ))}
        {[95, 190, 285].map(x => (
          <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="220" stroke="rgba(0,229,255,.07)" strokeWidth="1"/>
        ))}

        {/* --- LEG 1: TIMIKA -> WAMENA --- */}
        
        {/* Weather Cell on Direct Route (Midpoint approx 130, 140) */}
        <circle cx="130" cy="140" r="30" fill="url(#wx)" className="animate-pulse"/>
        <circle cx="130" cy="140" r="22" fill="rgba(255,50,50,.12)" stroke="rgba(255,50,50,.4)" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="130" y="143" textAnchor="middle" fill="rgba(255,100,100,.9)" fontSize="10" fontFamily="Share Tech Mono">⚡</text>
        <text x="130" y="153" textAnchor="middle" fill="rgba(255,100,100,.7)" fontSize="7" fontFamily="Share Tech Mono" letterSpacing="1">STORM CELL</text>

        {/* Direct Route (Danger) */}
        <line x1="60" y1="180" x2="200" y2="100" stroke="rgba(255,51,51,.3)" strokeWidth="1.5" strokeDasharray="6,4"/>
        <text x="95" y="175" fill="rgba(255,51,51,.5)" fontSize="7" fontFamily="Share Tech Mono" letterSpacing="1" transform="rotate(-30, 95, 175)">DIRECT (DANGER)</text>

        {/* Deviation Route (Safe) - Curving UP around weather */}
        <path d="M60,180 Q 90,100 200,100" stroke="url(#gradDev)" strokeWidth="1.5" fill="none" filter="url(#glow)">
             <animate attributeName="stroke-dashoffset" from="400" to="0" dur="3s" repeatCount="indefinite"/>
             <animate attributeName="stroke-dasharray" values="0,400;200,200;400,0" dur="3s" repeatCount="indefinite"/>
        </path>
        <text x="100" y="115" fill="var(--accent)" fontSize="7" fontFamily="Share Tech Mono" letterSpacing="1" opacity=".8" transform="rotate(-25, 100, 115)">DEVIATION (SAFE)</text>

        {/* Aircraft Dot Leg 1 */}
        <circle r="4" fill="var(--accent)" filter="url(#glow)">
            <animateMotion dur="3s" repeatCount="indefinite" path="M60,180 Q 90,100 200,100"/>
        </circle>

        {/* --- LEG 2: WAMENA -> ILAGA --- */}
        {/* Using Gradient Stroke */}
        <line x1="200" y1="100" x2="320" y2="60" stroke="url(#gradLeg2)" strokeWidth="2" filter="url(#glow)"/>

         {/* Aircraft Dot Leg 2 (Delayed) */}
         <circle r="3" fill="var(--green)" filter="url(#glow)">
            <animateMotion dur="4s" begin="1s" repeatCount="indefinite" path="M200,100 L320,60"/>
        </circle>


        {/* --- LOCATIONS --- */}

        {/* Timika (BLUE / ACCENT) */}
        <circle cx="60" cy="180" r="5" fill="var(--accent)" filter="url(#glow)"/>
        <circle cx="60" cy="180" r="9" fill="none" stroke="var(--accent)" strokeWidth="1" opacity=".4">
             <animate attributeName="r" values="9;15;9" dur="2s" repeatCount="indefinite"/>
             <animate attributeName="opacity" values=".4;0;.4" dur="2s" repeatCount="indefinite"/>
        </circle>
        <text x="60" y="200" textAnchor="middle" fill="var(--accent)" fontSize="9" fontFamily="Share Tech Mono" letterSpacing="1">TIMIKA (HQ)</text>

        {/* Wamena (YELLOW) */}
        <circle cx="200" cy="100" r="5" fill="var(--yellow)" filter="url(#glow)"/>
        <text x="200" y="85" textAnchor="middle" fill="var(--yellow)" fontSize="9" fontFamily="Share Tech Mono" letterSpacing="1">WAMENA</text>
        <text x="200" y="94" textAnchor="middle" fill="rgba(255,215,0,.5)" fontSize="7" fontFamily="Share Tech Mono">STOP 1</text>

        {/* Ilaga (GREEN) */}
        <circle cx="320" cy="60" r="5" fill="var(--green)" filter="url(#glow)"/>
        <text x="320" y="45" textAnchor="middle" fill="var(--green)" fontSize="9" fontFamily="Share Tech Mono" letterSpacing="1">ILAGA</text>
        <text x="320" y="54" textAnchor="middle" fill="rgba(57,255,122,.5)" fontSize="7" fontFamily="Share Tech Mono">DEST 2</text>

        {/* Compass */}
        <g transform="translate(350, 20)">
            <text x="0" y="0" fill="rgba(0,229,255,.4)" fontSize="8" fontFamily="Share Tech Mono" textAnchor="middle">N</text>
            <line x1="0" y1="2" x2="0" y2="14" stroke="rgba(0,229,255,.3)" strokeWidth="1"/>
            <text x="0" y="22" fill="rgba(0,229,255,.3)" fontSize="6" fontFamily="Share Tech Mono" textAnchor="middle">↑</text>
        </g>
      </svg>
    </div>
  );
};

export default TacticalMap;