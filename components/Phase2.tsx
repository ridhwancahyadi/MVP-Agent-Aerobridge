import React, { useState, useMemo } from 'react';
import { ShieldWarning, GasPump, Clock, Package, Warning, Thermometer, ArrowRight, ArrowLeft, Sliders, Binoculars, ListChecks, Lightning, Drop, TrendUp, WarningOctagon, Wind, Airplane, ArrowElbowDownRight, Scales, Stack, Crosshair, CloudFog, Info, CheckSquare, Square, MapPin, CaretRight } from '@phosphor-icons/react';
import TacticalMap from './TacticalMap';

interface Phase2Props {
  onBack: () => void;
  onNext: () => void;
}

type ObjType = 'payload' | 'time' | 'fuel' | 'env' | 'safety';

interface ObjectiveData {
  id: ObjType;
  label: string;
  icon: any;
  desc: string;
  weight: number; // 0-100
  active: boolean;
  color: string;
}

const Phase2: React.FC<Phase2Props> = ({ onBack, onNext }) => {
  // --- INCOMING DATA SIMULATION ---
  const INCOMING_PAYLOADS = [
    { name: 'Medical Supplies', w: 300, urg: true },
    { name: 'Power Units', w: 200, urg: false }
  ];
  const BASE_PAYLOAD = 500;

  // --- LIVE PARAMETERS (INPUTS) ---
  const [activeTab, setActiveTab] = useState<'payload' | 'fuel' | 'obj' | 'env'>('obj');

  const [payloadMod, setPayloadMod] = useState(0); 
  const [fuel, setFuel] = useState(1109); 
  
  // Environmental Sim
  const [tempDeviation, setTempDeviation] = useState(0); 
  const [windFactor, setWindFactor] = useState(0); 

  // --- DYNAMIC OBJECTIVES STATE ---
  const [objectives, setObjectives] = useState<ObjectiveData[]>([
    { 
      id: 'payload', 
      label: 'Delivery & Payload', 
      icon: Package, 
      desc: 'Maksimalkan muatan dalam satu penerbangan.', 
      weight: 50, 
      active: true,
      color: 'text-accent'
    },
    { 
      id: 'time', 
      label: 'Temporal', 
      icon: Clock, 
      desc: 'Minimalkan waktu tempuh & optimalkan departure window.', 
      weight: 50, 
      active: false,
      color: 'text-text-hi'
    },
    { 
      id: 'fuel', 
      label: 'Fuel Efficiency', 
      icon: GasPump, 
      desc: 'Minimalkan konsumsi bahan bakar & biaya avtur.', 
      weight: 50, 
      active: false,
      color: 'text-yellow'
    },
    { 
      id: 'env', 
      label: 'Environmental Risk', 
      icon: CloudFog, 
      desc: 'Minimalkan paparan cuaca & turbulence.', 
      weight: 50, 
      active: false,
      color: 'text-orange'
    },
    { 
      id: 'safety', 
      label: 'Safety Assurance', 
      icon: ShieldWarning, 
      desc: 'Minimalkan waktu di zona risiko & maksimalkan margin.', 
      weight: 80, 
      active: true,
      color: 'text-green'
    },
  ]);

  // Handlers for Objectives
  const toggleObjective = (id: ObjType) => {
    setObjectives(prev => prev.map(o => o.id === id ? { ...o, active: !o.active } : o));
  };

  const updateObjWeight = (id: ObjType, newWeight: number) => {
    setObjectives(prev => prev.map(o => o.id === id ? { ...o, weight: newWeight } : o));
  };

  const setPreset = (type: 'balanced' | 'hybrid') => {
    if (type === 'balanced') {
        setObjectives(prev => prev.map(o => ({ ...o, active: true, weight: 70 })));
    } else {
        // Hybrid: Reset to just Safety + Payload (Example)
        setObjectives(prev => prev.map(o => ({ 
            ...o, 
            active: o.id === 'safety' || o.id === 'payload', 
            weight: o.id === 'safety' ? 90 : 60 
        })));
    }
  };

  // --- CALCULATION ENGINE ---
  const analysis = useMemo(() => {
    const mtow = 11000;
    const totalPayload = BASE_PAYLOAD + payloadMod;
    const totalWeight = 5330 + totalPayload + fuel;

    // Physics Factors
    const fuelBurnBase = 1109.7;
    const timeBase = 1.466;
    const distBase = 205.24;
    const marginBase = 0.1447;

    // Adjust values based on inputs
    const fuelUsed = fuelBurnBase + (payloadMod * 0.2) - (windFactor * 5);
    const timeEst = timeBase - (windFactor * 0.01);
    
    // OGE Margin 
    const weightEffect = (totalWeight - (5330 + 500 + 1109)) * 0.00005;
    const tempEffect = tempDeviation * 0.004;
    const dynamicMargin = Math.max(0, marginBase - weightEffect - tempEffect);
    const fuelReserve = fuel - fuelUsed;

    // --- SCORING BASED ON ACTIVE OBJECTIVES ---
    let totalScoreWeight = 0;
    let weightedSum = 0;

    // Helper to add score component
    const addScore = (id: ObjType, rawScore: number) => {
        const obj = objectives.find(o => o.id === id);
        if (obj && obj.active) {
            weightedSum += rawScore * (obj.weight / 100);
            totalScoreWeight += (obj.weight / 100);
        }
    };

    // 1. Payload Score: Higher payload = better score (normalized against max safe)
    const payloadScore = Math.min(100, (totalPayload / 800) * 100);
    addScore('payload', payloadScore);

    // 2. Time Score: Faster (lower time) = better
    const timeScore = Math.min(100, Math.max(0, 100 - ((timeEst - 1.2) * 100))); 
    addScore('time', timeScore);

    // 3. Fuel Score: More reserve = better, Less burn = better
    const fuelScore = Math.min(100, (fuelReserve / 300) * 100);
    addScore('fuel', fuelScore);

    // 4. Env Score: Less deviation/wind = better
    const envScore = 100 - (Math.abs(tempDeviation) * 5) - (Math.abs(windFactor) * 2);
    addScore('env', envScore);

    // 5. Safety Score: High OGE Margin = better
    const safetyScore = Math.min(100, dynamicMargin * 600);
    addScore('safety', safetyScore);

    const finalScore = totalScoreWeight > 0 ? Math.round(weightedSum / totalScoreWeight) : 0;

    return {
        totalWeight,
        totalPayload,
        dynamicMargin,
        fuelUsed,
        timeEst,
        dist: distBase,
        finalScore,
        fuelReserve
    };
  }, [payloadMod, fuel, objectives, tempDeviation, windFactor]);

  const [selectedStrategy, setSelectedStrategy] = useState('Early Departure');
  
  // STRATEGY DEFINITIONS WITH DYNAMIC REASONING & IMPACT
  const strategies = [
    { 
      name: 'Early Departure', 
      score: 85, 
      level: 'hi', 
      desc: 'Depart 06:00. Optimal Density Altitude.', 
      rec: true,
      reasoning: {
        headsUp: [
            { k: 'Advantage', v: 'Cool Air (22°C)', c: 'text-green' },
            { k: 'Density Alt', v: '~9,277 ft (Ilaga)', c: 'text-text' },
            { k: 'Risk', v: 'Morning Fog (Leg 2)', c: 'text-yellow' }
        ],
        mitigations: [
            'Minimize OGE hover time on approach.',
            'Takeoff before thermal buildup.'
        ],
        contingencies: [
            'If Vis < 5km: DIVERT to Wamena immediately.',
            'Alt Landing Zone: Sector 4 Valley.'
        ]
      },
      impact: [
        { k: 'Fuel Deviation', v: 'Normal', c: 'text-green' },
        { k: 'Time Added', v: '+0 min', c: 'text-green' },
        { k: 'Seg 1 Safety', v: '✓ Cleared', c: 'text-green' },
        { k: 'Seg 2 Safety', v: '✓ Cleared', c: 'text-green' },
        { k: 'Crew Risk', v: 'LOW', c: 'text-green' },
        { k: 'Payload', v: '100% (700kg)', c: 'text-text-hi' }
      ]
    },
    { 
      name: 'Standard Profile', 
      score: 61, 
      level: 'mid', 
      desc: 'Depart 10:00. Balanced risk/reward.', 
      rec: false,
      reasoning: {
        headsUp: [
            { k: 'Temp Rise', v: '+6°C vs Early', c: 'text-orange' },
            { k: 'Performance', v: '-12% Lift Margin', c: 'text-red' },
            { k: 'Turbulence', v: 'Mod over ridges', c: 'text-yellow' }
        ],
        mitigations: [
            'Reduce payload by 50kg recommended.',
            'Approach via valley floor (avoid ridges).'
        ],
        contingencies: [
            'Hold at Waypoint Alpha for thermal decay.',
            'Abort if CHT limits exceeded.'
        ]
      },
      impact: [
        { k: 'Fuel Deviation', v: '+5% (Cooling)', c: 'text-yellow' },
        { k: 'Time Added', v: '+10 min', c: 'text-yellow' },
        { k: 'Seg 1 Safety', v: '⚠ Margins', c: 'text-orange' },
        { k: 'Seg 2 Safety', v: '✓ Cleared', c: 'text-green' },
        { k: 'Crew Risk', v: 'MEDIUM', c: 'text-orange' },
        { k: 'Payload', v: '90% (Rec)', c: 'text-yellow' }
      ]
    },
    { 
      name: 'Split Payload', 
      score: 92, 
      level: 'hi', 
      desc: 'Two sorties. Max Safety Margin.', 
      rec: false,
      reasoning: {
        headsUp: [
            { k: 'Ops Tempo', v: 'High (2 Sorties)', c: 'text-text' },
            { k: 'Duration', v: '+2.5 Hours', c: 'text-orange' },
            { k: 'Safety', v: 'Max OGE Margin', c: 'text-green' }
        ],
        mitigations: [
            'Crew fatigue monitoring required.',
            'Hot refueling at Wamena between sorties.'
        ],
        contingencies: [
            'Cancel Sortie 2 if weather deteriorates > 12:00.',
            'Load Priority Cargo on Sortie 1.'
        ]
      },
      impact: [
        { k: 'Fuel Deviation', v: '+80% (2 Sorties)', c: 'text-orange' },
        { k: 'Time Added', v: '+2.5 Hours', c: 'text-red' },
        { k: 'Seg 1 Safety', v: '✓ Max Margin', c: 'text-green' },
        { k: 'Seg 2 Safety', v: '✓ Max Margin', c: 'text-green' },
        { k: 'Crew Risk', v: 'LOW', c: 'text-green' },
        { k: 'Payload', v: '100% (2 Trips)', c: 'text-text-hi' }
      ]
    },
    { 
      name: 'Hold Mission', 
      score: 40, 
      level: 'lo', 
      desc: 'Wait for visibility > 8km.', 
      rec: false,
      reasoning: {
        headsUp: [
            { k: 'Window', v: 'Closing Rapidly', c: 'text-red' },
            { k: 'Probability', v: '40% Cancel Chance', c: 'text-red' },
            { k: 'Logistics', v: 'Backlog Increasing', c: 'text-yellow' }
        ],
        mitigations: [
            'Maintain Readiness State 2.',
            'Monitor satellite feeds every 30m.'
        ],
        contingencies: [
            'Push mission to Day+1 if no window by 14:00.',
            'Switch to ground transport for non-urgent.'
        ]
      },
      impact: [
        { k: 'Fuel Deviation', v: 'N/A', c: 'text-text-lo' },
        { k: 'Time Added', v: '+12 Hours', c: 'text-red' },
        { k: 'Seg 1 Safety', v: 'Pending', c: 'text-text-lo' },
        { k: 'Seg 2 Safety', v: 'Pending', c: 'text-text-lo' },
        { k: 'Crew Risk', v: 'LOW', c: 'text-green' },
        { k: 'Payload', v: 'Delayed', c: 'text-red' }
      ]
    },
  ];

  const activeStrat = strategies.find(s => s.name === selectedStrategy) || strategies[0];

  const getScoreColor = (val: number) => val > 75 ? 'text-green' : val > 50 ? 'text-yellow' : 'text-red';
  const rangeClass = "w-full h-1 bg-black/50 rounded-lg appearance-none cursor-pointer hover:bg-black/70 transition-all";

  // Tab Button Component
  const TabBtn = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-2 flex flex-col items-center justify-center gap-1 rounded border transition-all ${activeTab === id ? 'bg-accent/10 border-accent text-accent' : 'bg-black/20 border-border text-text-lo hover:bg-white/5 hover:text-text'}`}
    >
      <Icon size={16} weight={activeTab === id ? 'fill' : 'regular'}/>
      <span className="text-[8px] font-mono uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="animate-[fadeUp_0.3s_ease]">
      
      {/* Alert Strip */}
      <div className={`flex items-center gap-3 border-l-[3px] rounded-md p-2.5 mb-4 transition-colors duration-300
        ${analysis.dynamicMargin < 0.1 ? 'bg-red/10 border-red border-l-red' : 'bg-yellow/10 border-yellow/35 border-l-yellow'}
      `}>
        <Warning size={16} className={analysis.dynamicMargin < 0.1 ? 'text-red' : 'text-yellow'} weight="fill"/>
        <span className={`font-mono text-[11px] tracking-wider uppercase ${analysis.dynamicMargin < 0.1 ? 'text-red' : 'text-yellow'}`}>
          {analysis.dynamicMargin < 0.1 
            ? `CRITICAL: OGE MARGIN LOW (${analysis.dynamicMargin.toFixed(4)}). REDUCE PAYLOAD OR FUEL.` 
            : `PERFORMANCE ALERT — ILAGA: 9,277 FT DENSITY ALTITUDE · MARGIN ${analysis.dynamicMargin.toFixed(4)}`}
        </span>
      </div>

      <div className="bg-panel border border-border-hi rounded-lg overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-accent rounded-tl-lg z-10"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-accent rounded-br-lg z-10"></div>

        {/* Body Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-border">
          
          {/* COLUMN 1: STRATEGIC CONTEXT & AI REASONING */}
          <div className="p-4 flex flex-col gap-5">
            {/* Strategy Selection */}
            <div>
                <div className="font-mono text-[9px] font-bold tracking-[3px] uppercase text-text-lo mb-2 flex items-center gap-2">
                Select Strategy <span className="flex-1 h-px bg-border"></span>
                </div>
                <div className="flex flex-col gap-2">
                {strategies.map((s) => (
                    <div 
                    key={s.name}
                    onClick={() => setSelectedStrategy(s.name)}
                    className={`
                        p-2 bg-black/25 border rounded-md cursor-pointer transition-all relative overflow-hidden group
                        ${selectedStrategy === s.name ? 'border-accent bg-accent/5' : 'border-border hover:border-border-hi'}
                        ${s.rec ? 'border-green/40 bg-green/5' : ''}
                    `}
                    >
                    {s.rec && <div className="absolute top-0 right-0 bg-green text-black font-mono text-[8px] font-bold px-2 py-0.5 rounded-bl-md">REC</div>}
                    <div className="flex justify-between items-center mb-0.5">
                        <div className="text-[13px] font-bold text-text-hi tracking-wide">{s.name}</div>
                        <div className={`font-orbitron text-[11px] font-bold ${getScoreColor(s.score)}`}>{s.score}</div>
                    </div>
                    <div className="font-mono text-[9px] text-text-lo leading-tight">{s.desc}</div>
                    </div>
                ))}
                </div>
            </div>
            
            {/* AI REASONING (Unified One-Tone Card) - Expanded to fill column */}
            <div className="flex-1 flex flex-col gap-2 min-h-[300px]">
                <div className="font-mono text-[9px] font-bold tracking-[3px] uppercase text-text-lo flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                    Agent Reasoning <span className="flex-1 h-px bg-border"></span>
                </div>
                
                {/* Unified Reasoning Card - CLEAN ONE TONE */}
                <div className="bg-black/20 border border-border-hi rounded-md overflow-hidden flex-1 flex flex-col shadow-lg animate-[fadeIn_0.3s_ease]">
                    <div className="bg-white/5 p-3 border-b border-border flex justify-between items-center">
                         <div className="text-[10px] font-bold text-text-hi flex items-center gap-2">
                            <Binoculars size={14} className="text-accent"/> INTEL SUMMARY
                         </div>
                         <div className="text-[8px] font-mono text-text-lo tracking-wider">STRATEGY: {selectedStrategy.toUpperCase()}</div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
                        
                        {/* Section 1: Heads Up - Simplified */}
                        <div>
                             <div className="text-[9px] font-mono text-text-lo uppercase tracking-widest mb-2 flex items-center gap-2 border-b border-border/30 pb-1">
                                <WarningOctagon size={12} className="text-text"/> Operational Risks
                             </div>
                             <div className="flex flex-col gap-1.5">
                                {activeStrat.reasoning.headsUp.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-[10px]">
                                        <span className="text-text-lo font-mono">{item.k}</span>
                                        <span className={`font-bold ${item.c}`}>{item.v}</span>
                                    </div>
                                ))}
                             </div>
                        </div>

                         {/* Section 2: Mitigations - Clean list */}
                         <div>
                             <div className="text-[9px] font-mono text-text-lo uppercase tracking-widest mb-2 flex items-center gap-2 border-b border-border/30 pb-1">
                                <CheckSquare size={12} className="text-green"/> Mitigations
                             </div>
                             <ul className="space-y-1.5">
                                {activeStrat.reasoning.mitigations.map((m, i) => (
                                    <li key={i} className="text-[10px] text-text flex items-start gap-2 leading-relaxed">
                                        <span className="text-green mt-0.5"><CaretRight size={10} weight="bold"/></span> {m}
                                    </li>
                                ))}
                             </ul>
                        </div>

                         {/* Section 3: Contingencies - Clean list */}
                         <div>
                             <div className="text-[9px] font-mono text-text-lo uppercase tracking-widest mb-2 flex items-center gap-2 border-b border-border/30 pb-1">
                                <ArrowElbowDownRight size={12} className="text-red"/> Contingencies
                             </div>
                             <ul className="space-y-1.5">
                                {activeStrat.reasoning.contingencies.map((c, i) => (
                                    <li key={i} className="text-[10px] text-text flex items-start gap-2 leading-relaxed">
                                        <span className="text-red mt-0.5"><CaretRight size={10} weight="bold"/></span> {c}
                                    </li>
                                ))}
                             </ul>
                        </div>

                    </div>
                </div>
            </div>
          </div>

          {/* COLUMN 2: VISUAL INTELLIGENCE */}
          <div className="p-4 flex flex-col gap-3">
            <TacticalMap />
            <div className="flex-1 min-h-0 flex flex-col gap-2 mt-2 relative">
                 <div className="font-mono text-[9px] font-bold tracking-[3px] uppercase text-text-lo mb-1 flex items-center gap-2 sticky top-0 z-10 py-1">
                    Leg Analysis Breakdown <span className="flex-1 h-px bg-border"></span>
                </div>
                <div className="overflow-y-auto pr-1 flex flex-col gap-3 custom-scrollbar">
                    {/* Leg 1 */}
                    <div className="bg-black/30 border border-border rounded p-3 relative group hover:border-border-hi transition-colors shrink-0">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="text-[10px] font-bold text-text-hi flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_4px_var(--accent)]"></div>
                                    LEG 1: TIMIKA <ArrowRight size={10} className="text-text-lo"/> WAMENA
                                </div>
                                <div className="font-mono text-[9px] text-text-lo pl-3.5 mt-0.5">126.54 NM · 0.904 HRS</div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono text-[8px] text-yellow bg-yellow/10 px-1.5 py-0.5 rounded border border-yellow/20">WEAKEST MARGIN</div>
                            </div>
                        </div>

                        {/* Asset & Payload Context */}
                        <div className="mt-2 mb-2 p-1.5 bg-accent/5 border border-accent/10 rounded flex justify-between items-center">
                            <div className="flex items-center gap-2 text-[9px] font-mono text-text-hi">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" className="text-accent">
                                    <path d="M240,112a8,8,0,0,1-8,8H205.1l-14.9,29.8A16.1,16.1,0,0,1,175.9,160H80.1a16.1,16.1,0,0,1-14.3-9.2L50.9,112H24A8,8,0,0,1,24,96H56V64a8,8,0,0,1,16,0V96h64V64a8,8,0,0,1,16,0V96h48a8,8,0,0,1,0,16Zm-69.7,32,12-24H73.7l12,24ZM24,136a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V144A8,8,0,0,0,24,136Zm208,0a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V144A8,8,0,0,0,232,136ZM128,32a8,8,0,0,0-8-8H40a8,8,0,0,0,0,16h80A8,8,0,0,0,128,32Zm88-8H144a8,8,0,0,0,0,16h72a8,8,0,0,0,0-16Z"></path>
                                </svg> <span>EC725 CARACAL</span>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] font-mono text-text-lo">
                                <Package size={12} weight="fill" className="text-accent"/> <span className="text-text-hi font-bold">300 KG</span> <span className="hidden sm:inline">(Med Supplies)</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-[9px] border-t border-border/40 pt-2">
                            <div className="flex justify-between items-center"><span className="text-text-lo">ETA</span> <span className="text-text-hi">06:54</span></div>
                            <div className="flex justify-between items-center"><span className="text-text-lo">Weather</span> <span className="text-green">VIS 6KM</span></div>
                            <div className="flex justify-between items-center"><span className="text-text-lo">Density Alt</span> <span className="text-text-hi">6,678 FT</span></div>
                            <div className="flex justify-between items-center"><span className="text-text-lo">Fuel Burn</span> <span className="text-text-hi">{Math.round(analysis.fuelUsed * 0.6)} KG</span></div>
                            <div className="col-span-2 flex justify-between items-center bg-red/5 p-1 rounded border border-red/10">
                                <span className="text-red flex items-center gap-1"><ShieldWarning size={10} weight="fill"/> MIN MARGIN</span> 
                                <span className="text-red font-bold">{analysis.dynamicMargin.toFixed(4)} (CRITICAL)</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Leg 2 */}
                    <div className="bg-black/30 border border-border rounded p-3 relative group hover:border-border-hi transition-colors shrink-0">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="text-[10px] font-bold text-text-hi flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green shadow-[0_0_4px_var(--green)]"></div>
                                    LEG 2: WAMENA <ArrowRight size={10} className="text-text-lo"/> ILAGA
                                </div>
                                <div className="font-mono text-[9px] text-text-lo pl-3.5 mt-0.5">78.7 NM · 0.562 HRS</div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono text-[8px] text-orange bg-orange/10 px-1.5 py-0.5 rounded border border-orange/20">VIS ALERT</div>
                            </div>
                        </div>

                         {/* Asset & Payload Context */}
                         <div className="mt-2 mb-2 p-1.5 bg-green/5 border border-green/10 rounded flex justify-between items-center">
                            <div className="flex items-center gap-2 text-[9px] font-mono text-text-hi">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" className="text-green">
                                    <path d="M240,112a8,8,0,0,1-8,8H205.1l-14.9,29.8A16.1,16.1,0,0,1,175.9,160H80.1a16.1,16.1,0,0,1-14.3-9.2L50.9,112H24A8,8,0,0,1,24,96H56V64a8,8,0,0,1,16,0V96h64V64a8,8,0,0,1,16,0V96h48a8,8,0,0,1,0,16Zm-69.7,32,12-24H73.7l12,24ZM24,136a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V144A8,8,0,0,0,24,136Zm208,0a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V144A8,8,0,0,0,232,136ZM128,32a8,8,0,0,0-8-8H40a8,8,0,0,0,0,16h80A8,8,0,0,0,128,32Zm88-8H144a8,8,0,0,0,0,16h72a8,8,0,0,0,0-16Z"></path>
                                </svg> <span>EC725 CARACAL</span>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] font-mono text-text-lo">
                                <Lightning size={12} weight="fill" className="text-green"/> <span className="text-text-hi font-bold">200 KG</span> <span className="hidden sm:inline">(Power Units)</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-[9px] border-t border-border/40 pt-2">
                            <div className="flex justify-between items-center"><span className="text-text-lo">ETA</span> <span className="text-text-hi">08:05</span></div>
                            <div className="flex justify-between items-center"><span className="text-text-lo">Weather</span> <span className="text-orange font-bold">VIS 5KM (MARG)</span></div>
                            <div className="flex justify-between items-center"><span className="text-text-lo">Density Alt</span> <span className="text-red">9,277 FT</span></div>
                            <div className="flex justify-between items-center"><span className="text-text-lo">Fuel Burn</span> <span className="text-text-hi">{Math.round(analysis.fuelUsed * 0.4)} KG</span></div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* COLUMN 3: DYNAMIC PARAMETER TUNING */}
          <div className="p-3 bg-black/10 flex flex-col gap-2">
            
            <div className="font-mono text-[9px] font-bold tracking-[3px] uppercase text-text-lo flex items-center gap-2">
                <Sliders size={12} weight="bold"/> Mission Parameters <span className="flex-1 h-px bg-border"></span>
            </div>
            
            {/* TABS */}
            <div className="flex gap-1 mb-1">
                <TabBtn id="obj" icon={Crosshair} label="OBJECTIVES" />
                <TabBtn id="payload" icon={Package} label="PAYLOAD" />
                <TabBtn id="fuel" icon={GasPump} label="FUEL" />
                <TabBtn id="env" icon={CloudFog} label="CONDITIONS" />
            </div>

            {/* DYNAMIC CONTENT AREA */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 custom-scrollbar bg-black/20 border border-border/50 rounded p-2">
                
                {/* TAB 1: OBJECTIVES (MULTI SELECT) */}
                {activeTab === 'obj' && (
                     <div className="animate-[fadeIn_0.2s_ease]">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
                             <Info size={14} className="text-green"/>
                             <div className="text-[9px] text-text-lo italic leading-tight">
                                Select active mission objectives. Multiple selections create a Hybrid profile.
                             </div>
                        </div>

                        {/* Presets */}
                        <div className="flex gap-2 mb-3">
                            <button onClick={() => setPreset('balanced')} className="flex-1 py-1.5 bg-black/30 border border-border rounded hover:border-accent hover:text-accent transition-colors font-mono text-[9px] uppercase">
                                Balanced (All)
                            </button>
                             <button onClick={() => setPreset('hybrid')} className="flex-1 py-1.5 bg-black/30 border border-border rounded hover:border-accent hover:text-accent transition-colors font-mono text-[9px] uppercase">
                                Hybrid (Reset)
                            </button>
                        </div>

                        {/* Objectives List */}
                        <div className="flex flex-col gap-2">
                            {objectives.map((obj) => (
                                <div key={obj.id} className={`border rounded p-2 transition-all duration-300 ${obj.active ? `bg-accent/5 border-${obj.color.replace('text-', '')}/50` : 'bg-black/20 border-border opacity-60 hover:opacity-100'}`}>
                                    <div className="flex items-start gap-2 mb-2 cursor-pointer" onClick={() => toggleObjective(obj.id)}>
                                        <div className={`mt-0.5 ${obj.active ? obj.color : 'text-text-lo'}`}>
                                            {obj.active ? <CheckSquare size={14} weight="fill"/> : <Square size={14}/>}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`text-[10px] font-bold uppercase tracking-wide ${obj.active ? 'text-text-hi' : 'text-text-lo'}`}>{obj.label}</div>
                                            <div className="text-[8px] font-mono text-text-lo leading-tight mt-0.5">{obj.desc}</div>
                                        </div>
                                        <obj.icon size={16} className={obj.active ? obj.color : 'text-text-lo'} weight={obj.active ? 'fill' : 'regular'}/>
                                    </div>
                                    
                                    {/* Weight Slider (Only if Active) */}
                                    {obj.active && (
                                        <div className="pl-6 pr-1 animate-[fadeIn_0.3s_ease]">
                                            <div className="flex justify-between text-[8px] font-mono text-text-lo mb-0.5">
                                                <span>PRIORITY WEIGHT</span>
                                                <span className={obj.color}>{obj.weight}%</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="0" 
                                                max="100" 
                                                step="5" 
                                                value={obj.weight} 
                                                onChange={(e) => updateObjWeight(obj.id, parseInt(e.target.value))} 
                                                className={`w-full h-1 bg-black/50 rounded-lg appearance-none cursor-pointer hover:bg-black/70 transition-all accent-${obj.color.replace('text-', '')}`}
                                                style={{ accentColor: obj.color === 'text-text-hi' ? '#d8eef8' : undefined }} // Fallback for Tailwind color mapping issues in inline styles if needed, but accent-class usually works if config is good.
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 2: PAYLOAD */}
                {activeTab === 'payload' && (
                    <div className="animate-[fadeIn_0.2s_ease]">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
                             <Info size={14} className="text-accent"/>
                             <div className="text-[9px] text-text-lo italic leading-tight">
                                Adjust total cargo weight. Heavier payloads reduce hover performance (OGE) and fuel range.
                             </div>
                        </div>
                        <div className="flex flex-col gap-1 mb-3">
                            {INCOMING_PAYLOADS.map((p, i) => (
                                <div key={i} className="flex justify-between items-center text-[9px] font-mono text-text-lo bg-black/30 px-2 py-1.5 rounded border border-border/30">
                                    <span className="flex items-center gap-1">{p.urg && <Warning size={10} weight="fill" className="text-red"/>} {p.name}</span>
                                    <span className="text-text-hi font-bold">{p.w}kg</span>
                                </div>
                            ))}
                        </div>
                        <div className="group mt-2">
                            <div className="flex justify-between text-[8px] font-mono text-text-lo mb-1 uppercase">
                                <span>Total Adj Weight</span> <span className="text-accent text-[10px] font-bold">{analysis.totalPayload} kg</span>
                            </div>
                            <input type="range" min="-200" max="200" step="10" value={payloadMod} onChange={(e) => setPayloadMod(parseInt(e.target.value))} className={`${rangeClass} accent-accent`}/>
                        </div>
                    </div>
                )}

                {/* TAB 3: FUEL */}
                {activeTab === 'fuel' && (
                    <div className="animate-[fadeIn_0.2s_ease]">
                         <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
                             <Info size={14} className="text-yellow"/>
                             <div className="text-[9px] text-text-lo italic leading-tight">
                                Set departure fuel. Less fuel improves performance margin but risks "Bingo Fuel" diversion.
                             </div>
                        </div>
                        <div className="group mb-3">
                            <div className="flex justify-between text-[8px] font-mono text-text-lo mb-1 uppercase">
                                <span>Initial Fuel Load</span> <span className="text-yellow text-[10px] font-bold">{fuel} kg</span>
                            </div>
                            <input type="range" min="800" max="1500" step="10" value={fuel} onChange={(e) => setFuel(parseInt(e.target.value))} className={`${rangeClass} accent-yellow`}/>
                        </div>
                         <div className="bg-black/30 rounded p-2 border border-border/30">
                            <div className="flex justify-between text-[9px] font-mono mb-1">
                                <span className="text-text-lo">Est. Burn</span>
                                <span className="text-text-hi">{Math.round(analysis.fuelUsed)} kg</span>
                            </div>
                             <div className="flex justify-between text-[9px] font-mono">
                                <span className="text-text-lo">Reserve at Dest</span>
                                <span className={`font-bold ${analysis.fuelReserve < 300 ? 'text-red' : 'text-green'}`}>{Math.round(analysis.fuelReserve)} kg</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: ENVIRONMENT */}
                {activeTab === 'env' && (
                    <div className="animate-[fadeIn_0.2s_ease]">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
                             <Info size={14} className="text-text-lo"/>
                             <div className="text-[9px] text-text-lo italic leading-tight">
                                Simulate adverse weather. High temps reduce lift. Headwinds increase fuel burn.
                             </div>
                        </div>
                        <div className="space-y-3">
                            <div className="group">
                                <div className="flex justify-between text-[8px] font-mono text-text-lo mb-0.5 uppercase">
                                    <span>Temp Deviation ({tempDeviation > 0 ? '+' : ''}{tempDeviation}°C)</span> <Thermometer size={12} className="text-red"/>
                                </div>
                                <input type="range" min="-10" max="10" step="1" value={tempDeviation} onChange={(e) => setTempDeviation(parseInt(e.target.value))} className={`${rangeClass} accent-red`}/>
                            </div>
                            <div className="group">
                                <div className="flex justify-between text-[8px] font-mono text-text-lo mb-0.5 uppercase">
                                    <span>Wind Factor ({windFactor}kt)</span> <Wind size={12} className="text-text-lo"/>
                                </div>
                                <input type="range" min="-20" max="20" step="5" value={windFactor} onChange={(e) => setWindFactor(parseInt(e.target.value))} className={`${rangeClass} accent-text-lo`}/>
                                <div className="flex justify-between text-[8px] text-text-lo mt-1 px-1">
                                    <span>Headwind</span><span>Tailwind</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* IMPACT SUMMARY (Restored Precise Table) */}
            <div className="mt-auto">
                 <div className="font-mono text-[9px] font-bold tracking-[3px] uppercase text-text-lo mb-2 flex items-center gap-2">
                    Impact Summary <span className="flex-1 h-px bg-border"></span>
                </div>
                <div className="bg-black/30 border border-border rounded-md p-2.5 mb-2">
                    {activeStrat.impact.map((r, i) => (
                        <div key={i} className="flex justify-between font-mono text-[9px] py-1 border-b border-border/40 last:border-0 items-center">
                            <span className="text-text-lo uppercase tracking-wide">{r.k}</span>
                            <span className={`${r.c} font-bold`}>{r.v}</span>
                        </div>
                    ))}
                </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-black/40 flex items-center justify-end gap-3">
             <button 
                onClick={onBack} 
                className="px-6 py-3 bg-transparent border border-border-hi rounded text-text-lo font-mono text-[10px] hover:text-text hover:border-text-lo transition-colors flex items-center gap-2 group"
             >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform"/> BACK
            </button>
            <button 
                onClick={onNext} 
                disabled={analysis.dynamicMargin < 0.05}
                className={`px-6 py-3 border rounded font-orbitron text-[10px] font-bold tracking-[2px] uppercase transition-all flex items-center gap-2 group
                    ${analysis.dynamicMargin < 0.05
                        ? 'bg-red/10 border-red/30 text-red cursor-not-allowed opacity-50' 
                        : 'bg-gradient-to-br from-[#001133] to-[#003388] border-accent text-accent hover:shadow-[0_0_20px_rgba(0,100,255,0.3)] hover:-translate-y-px'
                    }
                `}
            >
                {analysis.dynamicMargin < 0.05 ? 'SAFETY MARGIN CRITICAL' : 'CONFIRM & GENERATE PLAN'} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

      </div>
    </div>
  );
};

export default Phase2;