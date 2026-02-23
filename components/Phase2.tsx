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
    { name: 'Cargo WAYL', w: 100, urg: true },
    { name: 'Cargo WABS', w: 100, urg: true }
  ];
  const BASE_PAYLOAD = 200;

  // --- LIVE PARAMETERS (INPUTS) ---
  const [activeTab, setActiveTab] = useState<'payload' | 'fuel' | 'obj' | 'env'>('obj');

  const [payloadMod, setPayloadMod] = useState(0); 
  const [fuel, setFuel] = useState(1300); 
  
  // Environmental Sim
  const [locConditions, setLocConditions] = useState<{
      [key: string]: { temp: number; wind: number }
  }>({
    gusimawa: { temp: 0, wind: 0 },
    ilaga: { temp: 0, wind: 0 },
    sinak: { temp: 0, wind: 0 }
  });

  // Derived global factors for calculation
  const tempDeviation = Math.max(...Object.values(locConditions).map(c => c.temp));
  const windFactor = Object.values(locConditions).reduce((acc, c) => acc + c.wind, 0) / 3;

  // --- DYNAMIC OBJECTIVES STATE ---
  const [objectives, setObjectives] = useState<ObjectiveData[]>([
    { 
      id: 'payload', 
      label: 'Delivery & Payload', 
      icon: Package, 
      desc: 'Maksimalkan muatan dalam satu penerbangan.', 
      weight: 60, 
      active: true,
      color: 'text-accent'
    },
    { 
      id: 'time', 
      label: 'Temporal', 
      icon: Clock, 
      desc: 'Minimalkan waktu tempuh & optimalkan departure window.', 
      weight: 10, 
      active: true,
      color: 'text-text-hi'
    },
    { 
      id: 'fuel', 
      label: 'Fuel Efficiency', 
      icon: GasPump, 
      desc: 'Minimalkan konsumsi bahan bakar & biaya avtur.', 
      weight: 10, 
      active: true,
      color: 'text-yellow'
    },
    { 
      id: 'env', 
      label: 'Environmental Risk', 
      icon: CloudFog, 
      desc: 'Minimalkan paparan cuaca & turbulence.', 
      weight: 10, 
      active: true,
      color: 'text-orange'
    },
    { 
      id: 'safety', 
      label: 'Safety Assurance', 
      icon: ShieldWarning, 
      desc: 'Minimalkan waktu di zona risiko & maksimalkan margin.', 
      weight: 10, 
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
    const fuelBurnBase = 1300;
    const timeBase = 2.0;
    const distBase = 140;
    const marginBase = 0.1;

    // Adjust values based on inputs
    const fuelUsed = fuelBurnBase + (payloadMod * 0.2) - (windFactor * 5);
    const timeEst = timeBase - (windFactor * 0.01);
    
    // OGE Margin 
    const weightEffect = (totalWeight - (5330 + 200 + 1300)) * 0.00005;
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
  }, [payloadMod, fuel, objectives, locConditions]);

  const [selectedStrategy, setSelectedStrategy] = useState('Minimum Legal');
  
  // STRATEGY DEFINITIONS WITH DYNAMIC REASONING & IMPACT
  const strategies = [
    { 
      name: 'Minimum Legal', 
      score: 69, 
      level: 'mid', 
      desc: 'Aggressive Profile. Max Payload.', 
      rec: true,
      primary_reason: 'Memaksimalkan payload dengan tetap mematuhi batas legal minimum.',
      reasoning: {
        executive_summary: {
            supporting_factors: [
              "Semua lokasi memenuhi syarat ketinggian.",
              "Bahan bakar cukup untuk misi."
            ],
            attention_factors: [
              "Ketinggian lokasi WAYL dan WABS tinggi.",
              "Margin bahan bakar ketat."
            ],
            key_mitigations: [
              "Monitor bahan bakar selama penerbangan.",
              "Siapkan rencana darurat jika bahan bakar rendah."
            ]
        },
        mitigations: [
            {
              leg_index: 0,
              actions: [
                "Monitor bahan bakar selama penerbangan.",
                "Siapkan rencana darurat jika bahan bakar rendah."
              ],
              evidence: ["Ketersediaan bahan bakar terbatas."]
            },
            {
              leg_index: 1,
              actions: [
                "Monitor bahan bakar selama penerbangan.",
                "Siapkan rencana darurat jika bahan bakar rendah."
              ],
              evidence: ["Ketersediaan bahan bakar terbatas."]
            }
        ],
        contingencies: [
            {
              trigger: "Jika bahan bakar mendekati batas minimum.",
              action: "Rencanakan pendaratan di lokasi terdekat.",
              evidence: ["Ketersediaan bahan bakar terbatas."]
            },
            {
              trigger: "Jika cuaca memburuk.",
              action: "Tunda penerbangan hingga cuaca membaik.",
              evidence: ["Visibilitas baik di lokasi."]
            }
        ]
      }
    }
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
            : `PERFORMANCE ALERT — HIGH ELEVATION OPS (WAYL/WABS) · MARGIN ${analysis.dynamicMargin.toFixed(4)}`}
        </span>
      </div>

      <div className="bg-panel border border-border-hi rounded-lg overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-accent rounded-tl-lg z-10"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-accent rounded-br-lg z-10"></div>

        {/* Body Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_0.8fr] divide-y lg:divide-y-0 lg:divide-x divide-border">
          
          {/* COLUMN 1: STRATEGIC CONTEXT & AI REASONING */}
          <div className="p-4 flex flex-col gap-5">
            {/* Strategy Selection - ENLARGED */}
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
                        p-4 bg-black/25 border rounded-md cursor-pointer transition-all relative overflow-hidden group
                        ${selectedStrategy === s.name ? 'border-accent bg-accent/5' : 'border-border hover:border-border-hi'}
                        ${s.rec ? 'border-green/40 bg-green/5' : ''}
                    `}
                    >
                    {s.rec && <div className="absolute top-0 right-0 bg-green text-black font-mono text-[9px] font-bold px-3 py-1 rounded-bl-md">RECOMMENDED</div>}
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-base font-bold text-text-hi tracking-wide">{s.name}</div>
                        <div className={`font-orbitron text-lg font-bold ${getScoreColor(s.score)}`}>{s.score}</div>
                    </div>
                    <div className="font-mono text-[11px] text-text-lo leading-relaxed">{s.desc}</div>
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
                        
                        {/* Section 1: Executive Summary */}
                        <div>
                             <div className="text-[9px] font-mono text-text-lo uppercase tracking-widest mb-2 flex items-center gap-2 border-b border-border/30 pb-1">
                                <Binoculars size={12} className="text-text"/> Executive Summary
                             </div>
                             <div className="flex flex-col gap-2">
                                {/* Supporting Factors */}
                                {activeStrat.reasoning.executive_summary?.supporting_factors.length > 0 && (
                                    <div className="bg-green/5 rounded p-2 border border-green/10">
                                        <div className="text-[9px] font-bold text-green mb-1 flex items-center gap-1">
                                            <CheckSquare size={10} weight="fill"/> SUPPORTING FACTORS
                                        </div>
                                        <ul className="space-y-1">
                                            {activeStrat.reasoning.executive_summary.supporting_factors.map((factor: string, i: number) => (
                                                <li key={i} className="text-[10px] text-text-lo flex items-start gap-1.5 leading-tight">
                                                    <span className="text-green mt-0.5">•</span> {factor}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Attention Factors */}
                                {activeStrat.reasoning.executive_summary?.attention_factors.length > 0 && (
                                    <div className="bg-yellow/5 rounded p-2 border border-yellow/10">
                                        <div className="text-[9px] font-bold text-yellow mb-1 flex items-center gap-1">
                                            <Warning size={10} weight="fill"/> ATTENTION FACTORS
                                        </div>
                                        <ul className="space-y-1">
                                            {activeStrat.reasoning.executive_summary.attention_factors.map((factor: string, i: number) => (
                                                <li key={i} className="text-[10px] text-text-lo flex items-start gap-1.5 leading-tight">
                                                    <span className="text-yellow mt-0.5">•</span> {factor}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                             </div>
                        </div>

                         {/* Section 2: Mitigations - Clean list */}
                         <div>
                             <div className="text-[9px] font-mono text-text-lo uppercase tracking-widest mb-2 flex items-center gap-2 border-b border-border/30 pb-1">
                                <CheckSquare size={12} className="text-green"/> Mitigations
                             </div>
                             <div className="flex flex-col gap-2">
                                {activeStrat.reasoning.mitigations.map((m: any, i: number) => (
                                    <div key={i} className="bg-white/5 rounded p-2 border border-white/10">
                                        <div className="text-[9px] font-bold text-text-hi mb-1.5 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-accent"></div>
                                            LEG {m.leg_index + 1}
                                        </div>
                                        <ul className="space-y-1">
                                            {m.actions.map((action: string, j: number) => (
                                                <li key={j} className="text-[10px] text-text-lo flex items-start gap-1.5 leading-tight">
                                                    <span className="text-green mt-0.5"><CaretRight size={8} weight="bold"/></span> {action}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                             </div>
                        </div>

                         {/* Section 3: Contingencies - Clean list */}
                         <div>
                             <div className="text-[9px] font-mono text-text-lo uppercase tracking-widest mb-2 flex items-center gap-2 border-b border-border/30 pb-1">
                                <ArrowElbowDownRight size={12} className="text-red"/> Contingencies
                             </div>
                             <ul className="space-y-2">
                                {activeStrat.reasoning.contingencies.map((c: any, i: number) => (
                                    <li key={i} className="text-[10px] text-text flex flex-col gap-1 leading-relaxed bg-red/5 p-2 rounded border border-red/10">
                                        <div className="flex items-start gap-1.5 text-red">
                                            <Warning size={12} weight="fill" className="mt-0.5 shrink-0"/> 
                                            <span className="font-bold">{c.trigger}</span>
                                        </div>
                                        <div className="flex items-start gap-1.5 text-text-hi pl-4 border-l border-red/20 ml-1">
                                            <ArrowRight size={10} className="mt-0.5 shrink-0 text-text-lo"/>
                                            <span>{c.action}</span>
                                        </div>
                                    </li>
                                ))}
                             </ul>
                        </div>

                    </div>
                </div>
            </div>
          </div>

          {/* COLUMN 2: VISUAL INTELLIGENCE & LEG ANALYSIS */}
          <div className="p-4 flex flex-col gap-3 h-full">
            <TacticalMap />
            <div className="flex-1 min-h-0 flex flex-col gap-2 relative h-full">
                 <div className="font-mono text-[9px] font-bold tracking-[3px] uppercase text-text-lo mb-1 flex items-center gap-2 sticky top-0 z-10 py-1">
                    Leg Analysis Breakdown <span className="flex-1 h-px bg-border"></span>
                </div>
                <div className="overflow-y-auto pr-1 flex flex-col gap-3 custom-scrollbar h-full">
                    {/* Leg 1 */}
                    <div className="bg-black/30 border border-border rounded p-4 relative group hover:border-border-hi transition-colors shrink-0">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="text-xs font-bold text-text-hi flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_4px_var(--accent)]"></div>
                                    LEG 1: GUSIMAWA <ArrowRight size={12} className="text-text-lo"/> ILAGA
                                </div>
                                <div className="font-mono text-[10px] text-text-lo pl-4 mt-1">70 NM · 1.0 HRS</div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono text-[9px] text-yellow bg-yellow/10 px-2 py-1 rounded border border-yellow/20">HIGH ELEVATION</div>
                            </div>
                        </div>

                        {/* Asset & Payload Context */}
                        <div className="mt-3 mb-3 p-2 bg-accent/5 border border-accent/10 rounded flex justify-between items-center">
                            <div className="flex items-center gap-2 text-[10px] font-mono text-text-hi">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256" className="text-accent">
                                    <path d="M240,112a8,8,0,0,1-8,8H205.1l-14.9,29.8A16.1,16.1,0,0,1,175.9,160H80.1a16.1,16.1,0,0,1-14.3-9.2L50.9,112H24A8,8,0,0,1,24,96H56V64a8,8,0,0,1,16,0V96h64V64a8,8,0,0,1,16,0V96h48a8,8,0,0,1,0,16Zm-69.7,32,12-24H73.7l12,24ZM24,136a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V144A8,8,0,0,0,24,136Zm208,0a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V144A8,8,0,0,0,232,136ZM128,32a8,8,0,0,0-8-8H40a8,8,0,0,0,0,16h80A8,8,0,0,0,128,32Zm88-8H144a8,8,0,0,0,0,16h72a8,8,0,0,0,0-16Z"></path>
                                </svg> <span>EC725 CARACAL</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-mono text-text-lo">
                                <Package size={14} weight="fill" className="text-accent"/> <span className="text-text-hi font-bold">100 KG</span> <span className="hidden sm:inline">(Cargo WAYL)</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-[10px] border-t border-border/40 pt-3">
                            <div className="flex justify-between items-center"><span className="text-text-lo">ETA</span> <span className="text-text-hi">11:00</span></div>
                            <div className="flex justify-between items-center"><span className="text-text-lo">Weather</span> <span className="text-green">VIS 10KM</span></div>
                            <div className="flex justify-between items-center"><span className="text-text-lo">Elevation</span> <span className="text-text-hi">7,923 FT</span></div>
                            <div className="flex justify-between items-center"><span className="text-text-lo">Fuel Burn</span> <span className="text-text-hi">{Math.round(analysis.fuelUsed * 0.5)} KG</span></div>
                            <div className="col-span-2 flex justify-between items-center bg-yellow/5 p-1.5 rounded border border-yellow/10 mt-1">
                                <span className="text-yellow flex items-center gap-1"><ShieldWarning size={12} weight="fill"/> FUEL MARGIN</span> 
                                <span className="text-yellow font-bold">TIGHT</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Leg 2 */}
                    <div className="bg-black/30 border border-border rounded p-4 relative group hover:border-border-hi transition-colors shrink-0">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="text-xs font-bold text-text-hi flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green shadow-[0_0_4px_var(--green)]"></div>
                                    LEG 2: ILAGA <ArrowRight size={12} className="text-text-lo"/> SINAK
                                </div>
                                <div className="font-mono text-[10px] text-text-lo pl-4 mt-1">70 NM · 1.0 HRS</div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono text-[9px] text-orange bg-orange/10 px-2 py-1 rounded border border-orange/20">HIGH ELEVATION</div>
                            </div>
                        </div>

                         {/* Asset & Payload Context */}
                         <div className="mt-3 mb-3 p-2 bg-green/5 border border-green/10 rounded flex justify-between items-center">
                            <div className="flex items-center gap-2 text-[10px] font-mono text-text-hi">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256" className="text-green">
                                    <path d="M240,112a8,8,0,0,1-8,8H205.1l-14.9,29.8A16.1,16.1,0,0,1,175.9,160H80.1a16.1,16.1,0,0,1-14.3-9.2L50.9,112H24A8,8,0,0,1,24,96H56V64a8,8,0,0,1,16,0V96h64V64a8,8,0,0,1,16,0V96h48a8,8,0,0,1,0,16Zm-69.7,32,12-24H73.7l12,24ZM24,136a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V144A8,8,0,0,0,24,136Zm208,0a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V144A8,8,0,0,0,232,136ZM128,32a8,8,0,0,0-8-8H40a8,8,0,0,0,0,16h80A8,8,0,0,0,128,32Zm88-8H144a8,8,0,0,0,0,16h72a8,8,0,0,0,0-16Z"></path>
                                </svg> <span>EC725 CARACAL</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-mono text-text-lo">
                                <Lightning size={14} weight="fill" className="text-green"/> <span className="text-text-hi font-bold">100 KG</span> <span className="hidden sm:inline">(Cargo WABS)</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-[10px] border-t border-border/40 pt-3">
                            <div className="flex justify-between items-center"><span className="text-text-lo">ETA</span> <span className="text-text-hi">12:00</span></div>
                            <div className="flex justify-between items-center"><span className="text-text-lo">Weather</span> <span className="text-green">VIS 10KM</span></div>
                            <div className="flex justify-between items-center"><span className="text-text-lo">Elevation</span> <span className="text-red">7,214 FT</span></div>
                            <div className="flex justify-between items-center"><span className="text-text-lo">Fuel Burn</span> <span className="text-text-hi">{Math.round(analysis.fuelUsed * 0.5)} KG</span></div>
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
                                Adjust conditions per location. Max Temp affects OGE margin. Avg Wind affects fuel.
                             </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { id: 'gusimawa', name: 'GUSIMAWA (Origin)' },
                                { id: 'ilaga', name: 'ILAGA (Stop 1)' },
                                { id: 'sinak', name: 'SINAK (Dest)' }
                            ].map((loc) => (
                                <div key={loc.id} className="bg-white/5 rounded p-2 border border-white/10">
                                    <div className="text-[9px] font-bold text-text-hi mb-2 uppercase tracking-wider flex items-center gap-2">
                                        <MapPin size={10} className="text-accent"/> {loc.name}
                                    </div>
                                    
                                    {/* Temp Slider */}
                                    <div className="group mb-2">
                                        <div className="flex justify-between text-[8px] font-mono text-text-lo mb-0.5 uppercase">
                                            <span>Temp Dev ({locConditions[loc.id].temp > 0 ? '+' : ''}{locConditions[loc.id].temp}°C)</span> 
                                            <Thermometer size={10} className={locConditions[loc.id].temp > 5 ? "text-red" : "text-text-lo"}/>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="-5" 
                                            max="15" 
                                            step="1" 
                                            value={locConditions[loc.id].temp} 
                                            onChange={(e) => setLocConditions(prev => ({
                                                ...prev,
                                                [loc.id]: { ...prev[loc.id], temp: parseInt(e.target.value) }
                                            }))} 
                                            className={`${rangeClass} accent-red`}
                                        />
                                    </div>

                                    {/* Wind Slider */}
                                    <div className="group">
                                        <div className="flex justify-between text-[8px] font-mono text-text-lo mb-0.5 uppercase">
                                            <span>Wind ({locConditions[loc.id].wind}kt)</span> 
                                            <Wind size={10} className="text-text-lo"/>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="-20" 
                                            max="20" 
                                            step="5" 
                                            value={locConditions[loc.id].wind} 
                                            onChange={(e) => setLocConditions(prev => ({
                                                ...prev,
                                                [loc.id]: { ...prev[loc.id], wind: parseInt(e.target.value) }
                                            }))} 
                                            className={`${rangeClass} accent-blue-400`}
                                        />
                                        <div className="flex justify-between text-[7px] text-text-lo mt-0.5 px-0.5 opacity-60">
                                            <span>Headwind</span><span>Tailwind</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* IMPACT SUMMARY */}
            <div className="mt-auto">
                 <div className="font-mono text-[9px] font-bold tracking-[3px] uppercase text-text-lo mb-2 flex items-center gap-2">
                    Impact Summary <span className="flex-1 h-px bg-border"></span>
                </div>
                <div className="bg-black/30 border border-border rounded-md p-3 mb-2 flex flex-col gap-1.5">
                    {(() => {
                        const getStatus = (score: number) => {
                            if (score <= 40) return { label: 'CRITICAL', color: 'text-red' };
                            if (score <= 60) return { label: 'VULNERABLE', color: 'text-orange' };
                            if (score <= 80) return { label: 'STABLE', color: 'text-yellow' };
                            return { label: 'OPTIMAL', color: 'text-green' };
                        };
                        const status = getStatus(activeStrat.score);
                        
                        return (
                            <>
                                <div className="flex justify-between font-mono text-[9px] items-center border-b border-border/30 pb-1">
                                    <span className="text-text-lo uppercase tracking-wide">Operational Status</span>
                                    <span className={`${status.color} font-bold`}>{status.label}</span>
                                </div>
                                <div className="flex justify-between font-mono text-[9px] items-center border-b border-border/30 pb-1">
                                    <span className="text-text-lo uppercase tracking-wide">Total Payload</span>
                                    <span className="text-text-hi font-bold">{analysis.totalPayload} KG</span>
                                </div>
                                <div className="flex justify-between font-mono text-[9px] items-center border-b border-border/30 pb-1">
                                    <span className="text-text-lo uppercase tracking-wide">Total Fuel Burn</span>
                                    <span className="text-text-hi font-bold">{Math.round(analysis.fuelUsed)} KG</span>
                                </div>
                                <div className="flex justify-between font-mono text-[9px] items-center border-b border-border/30 pb-1">
                                    <span className="text-text-lo uppercase tracking-wide">Total Distance</span>
                                    <span className="text-text-hi font-bold">{analysis.dist} NM</span>
                                </div>
                                <div className="flex justify-between font-mono text-[9px] items-center border-b border-border/30 pb-1">
                                    <span className="text-text-lo uppercase tracking-wide">Selected Strategy</span>
                                    <span className="text-accent font-bold">{selectedStrategy}</span>
                                </div>
                                <div className="flex justify-between font-mono text-[9px] items-center border-b border-border/30 pb-1">
                                    <span className="text-text-lo uppercase tracking-wide">Mission Time</span>
                                    <span className="text-text-hi font-bold">{Math.round(analysis.timeEst * 60)} MIN</span>
                                </div>
                                <div className="flex flex-col font-mono text-[9px] gap-1 border-b border-border/30 pb-1">
                                    <span className="text-text-lo uppercase tracking-wide">Primary Reason</span>
                                    <span className="text-text-hi leading-tight">{(activeStrat as any).primary_reason}</span>
                                </div>
                                <div className="flex justify-between font-mono text-[9px] items-center pt-1">
                                    <span className="text-text-lo uppercase tracking-wide">Score</span>
                                    <span className={`${getScoreColor(activeStrat.score)} font-bold text-[11px]`}>{activeStrat.score}</span>
                                </div>
                            </>
                        );
                    })()}
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