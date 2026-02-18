import React, { useState, useEffect } from 'react';
import { ArrowRight, Airplane, Plus, Package, CaretRight, CalendarBlank, Trash, X, Drop, Warning, Check, MapPin, CaretUp, CaretDown, ListPlus } from '@phosphor-icons/react';

interface Phase1Props {
  onNext: () => void;
}

interface FleetItem {
  id: number;
  name: string;
  type: 'Rotary' | 'Fixed';
  cap: string;
  fuel: number;
}

interface PayloadItem {
  id: number;
  item: string;
  weight: number;
  origin: string;
  dest: string;
  isUrgent: boolean;
}

interface RouteItem {
  id: number;
  location: string;
}

const AIRCRAFT_OPTIONS = [
  { name: 'Cessna 208B', type: 'Fixed', cap: 'CARAVAN' },
  { name: 'EC725 Caracal', type: 'Rotary', cap: 'HEAVY LIFT' },
  { name: 'Mi-17', type: 'Rotary', cap: 'HEAVY LIFT' },
  { name: 'Bell 412', type: 'Rotary', cap: 'MEDIUM LIFT' },
] as const;

const Phase1: React.FC<Phase1Props> = ({ onNext }) => {
  const [commandText, setCommandText] = useState('');
  
  // State for Date
  const [missionDate, setMissionDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // State for Route
  const [routes, setRoutes] = useState<RouteItem[]>([
    { id: 1, location: 'Timika (Base)' },
    { id: 2, location: 'Wamena (Stop 1)' },
    { id: 3, location: 'Ilaga (Dest)' }
  ]);
  const [newRouteLoc, setNewRouteLoc] = useState('');

  // State for Dynamic Fleet
  const [fleets, setFleets] = useState<FleetItem[]>([
    { id: 1, name: 'EC725 Caracal', type: 'Rotary', cap: 'HEAVY LIFT', fuel: 1200 },
  ]);
  const [selectedAircraft, setSelectedAircraft] = useState<string>(AIRCRAFT_OPTIONS[1].name);
  const [newFleetFuel, setNewFleetFuel] = useState('');

  // State for Dynamic Payload
  const [payloads, setPayloads] = useState<PayloadItem[]>([
    { id: 1, item: 'Medical Supplies', weight: 300, origin: 'Timika', dest: 'Wamena', isUrgent: true },
    { id: 2, item: 'Power Units', weight: 200, origin: 'Timika', dest: 'Ilaga', isUrgent: false },
  ]);
  
  // Payload Form State
  const [pItem, setPItem] = useState('');
  const [pWeight, setPWeight] = useState('');
  const [pOrigin, setPOrigin] = useState('Timika');
  const [pDest, setPDest] = useState('');
  const [pIsUrgent, setPIsUrgent] = useState(false);

  const fullText = "Transport 300kg Cargo to Wamena and 200kg to Ilaga from Timika. Asset: EC725 Caracal.";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setCommandText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // --- Route Handlers ---
  const handleRouteChange = (id: number, val: string) => {
    setRoutes(routes.map(r => r.id === id ? { ...r, location: val } : r));
  };

  const addRoute = () => {
    const newItem: RouteItem = { id: Date.now(), location: newRouteLoc || 'New Waypoint' };
    // Add before the last item if possible, otherwise push
    if (routes.length > 1) {
        const newRoutes = [...routes];
        newRoutes.splice(routes.length - 1, 0, newItem);
        setRoutes(newRoutes);
    } else {
        setRoutes([...routes, newItem]);
    }
    setNewRouteLoc('');
  };

  const removeRoute = (index: number) => {
    if (routes.length <= 2) return; // Prevent deleting if only origin and dest remain
    const newRoutes = routes.filter((_, i) => i !== index);
    setRoutes(newRoutes);
  };

  const moveRoute = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === routes.length - 1) return;
    
    const newRoutes = [...routes];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newRoutes[index], newRoutes[swapIndex]] = [newRoutes[swapIndex], newRoutes[index]];
    setRoutes(newRoutes);
  };

  // --- Fleet Handlers ---
  const addFleet = () => {
    if (!newFleetFuel) return;
    const aircraftInfo = AIRCRAFT_OPTIONS.find(a => a.name === selectedAircraft) || AIRCRAFT_OPTIONS[0];
    const newItem: FleetItem = {
      id: Date.now(),
      name: aircraftInfo.name,
      type: aircraftInfo.type as 'Rotary' | 'Fixed',
      cap: aircraftInfo.cap,
      fuel: parseInt(newFleetFuel)
    };
    setFleets([...fleets, newItem]);
    setNewFleetFuel('');
  };

  const removeFleet = (id: number) => {
    setFleets(fleets.filter(f => f.id !== id));
  };

  // --- Payload Handlers ---
  const addPayload = () => {
    if (!pItem || !pWeight || !pDest) return;
    const newItem: PayloadItem = {
      id: Date.now(),
      item: pItem,
      weight: parseInt(pWeight),
      origin: pOrigin,
      dest: pDest,
      isUrgent: pIsUrgent
    };
    setPayloads([...payloads, newItem]);
    setPItem('');
    setPWeight('');
    setPDest('');
    setPIsUrgent(false);
  };

  const removePayload = (id: number) => {
    setPayloads(payloads.filter(p => p.id !== id));
  };

  const totalWeight = payloads.reduce((acc, curr) => acc + curr.weight, 0);

  return (
    <div className="animate-[fadeUp_0.3s_ease]">
      <div className="bg-panel border border-border-hi rounded-lg overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-accent rounded-tl-lg z-10"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-accent rounded-br-lg z-10"></div>

        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-start bg-accent/5">
          <div>
            <div className="font-orbitron text-base font-bold text-text-hi tracking-widest uppercase">Command Input</div>
            <div className="font-mono text-[10px] text-text-lo mt-1 tracking-wider">// NATURAL LANGUAGE MISSION PARSER · AUTO-INTEL ACTIVE</div>
          </div>
          <div className="font-mono text-[9px] text-text-lo text-right tracking-widest">
            MISSION ID: DEMO-001<br />
            CLASSIFICATION: RESTRICTED
          </div>
        </div>

        {/* Body - Using Grid for Precision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          
          {/* Left Column */}
          <div className="p-5 flex flex-col gap-5">
            
            {/* NLP Section */}
            <div>
                <div className="font-mono text-[9px] tracking-[3px] uppercase text-text-lo mb-2 flex items-center gap-2">
                Natural Language Command <span className="flex-1 h-px bg-border"></span>
                </div>
                <div className="bg-black/40 border border-border-hi rounded-md p-3 font-mono text-xs text-accent leading-relaxed min-h-[70px] relative shadow-inner">
                {commandText}<span className="animate-pulse">█</span>
                </div>
            </div>

            {/* Mission Parameters */}
            <div className="bg-black/20 border border-border rounded-md p-3">
                <div className="font-mono text-[9px] tracking-[3px] uppercase text-text-lo mb-3 flex items-center gap-2">
                    Mission Parameters <span className="flex-1 h-px bg-border/50"></span>
                </div>
                <label className="block font-mono text-[10px] text-text-lo mb-1 uppercase tracking-wider">Mission Date</label>
                <div className="relative group">
                    <input 
                    type="date" 
                    value={missionDate}
                    onChange={(e) => setMissionDate(e.target.value)}
                    className="w-full bg-black/40 border border-border text-text-hi font-mono text-xs px-3 py-2 rounded focus:border-accent focus:outline-none focus:shadow-[0_0_10px_rgba(0,229,255,0.1)] transition-all uppercase appearance-none"
                    />
                    <CalendarBlank size={14} className="absolute right-3 top-2.5 text-accent pointer-events-none" />
                </div>
            </div>

             {/* Quick Templates */}
             <div className="bg-black/20 border border-border rounded-md p-3">
                 <div className="font-mono text-[9px] tracking-[3px] uppercase text-text-lo mb-3 flex items-center gap-2">
                    Quick Templates <span className="flex-1 h-px bg-border/50"></span>
                </div>
                <button className="w-full text-left p-2 bg-accent/5 border border-border rounded text-text font-mono text-[10px] hover:border-accent2 hover:text-text-hi hover:bg-accent/10 transition-colors flex items-start gap-2 group">
                    <CaretRight size={12} className="text-accent mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                    Deploy 300kg to Wamena + 200kg to Ilaga via Timika.
                </button>
            </div>

            {/* Flight Route Section - Moved to Left for Balance or keep in separate container */}
            <div className="bg-black/20 border border-border rounded-md p-3 flex-1 flex flex-col">
                <div className="font-mono text-[9px] tracking-[3px] uppercase text-text-lo mb-3 flex items-center gap-2">
                    Flight Route <span className="flex-1 h-px bg-border/50"></span>
                    <button onClick={addRoute} className="text-accent hover:text-white" title="Add Waypoint"><ListPlus size={14}/></button>
                </div>
                
                <div className="flex flex-col gap-0 relative">
                    {/* Vertical Connecting Line */}
                    <div className="absolute top-2 left-[5.5px] bottom-6 w-px bg-border-hi z-0"></div>

                    {routes.map((route, index) => {
                        const isFirst = index === 0;
                        const isLast = index === routes.length - 1;
                        // Color logic: Origin=Accent, Stops=Yellow, Dest=Green
                        const dotColor = isFirst ? 'bg-accent shadow-[0_0_6px_var(--accent)]' : isLast ? 'bg-green shadow-[0_0_6px_var(--green)]' : 'bg-yellow shadow-[0_0_6px_var(--yellow)]';
                        
                        return (
                            <div key={route.id} className="flex items-center gap-3 mb-2 last:mb-0 relative z-10 group">
                                <div className={`w-3 h-3 rounded-full shrink-0 ${dotColor} border border-black`}></div>
                                
                                <div className="flex-1 flex items-center gap-1">
                                    <div className="flex-1 flex items-center gap-2 bg-black/40 border border-border rounded px-2 py-1.5 text-text-hi font-mono text-[11px] focus-within:border-accent transition-all">
                                        <MapPin size={12} className="text-text-lo shrink-0" />
                                        <input 
                                            type="text" 
                                            value={route.location} 
                                            onChange={(e) => handleRouteChange(route.id, e.target.value)} 
                                            className="bg-transparent border-none outline-none w-full placeholder-text-lo text-ellipsis"
                                        />
                                    </div>
                                    
                                    {/* Route Controls */}
                                    <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => moveRoute(index, 'up')} disabled={isFirst} className="text-text-lo hover:text-accent disabled:opacity-30"><CaretUp size={10} weight="bold"/></button>
                                        <button onClick={() => moveRoute(index, 'down')} disabled={isLast} className="text-text-lo hover:text-accent disabled:opacity-30"><CaretDown size={10} weight="bold"/></button>
                                    </div>
                                    <button 
                                        onClick={() => removeRoute(index)}
                                        disabled={routes.length <= 2}
                                        className="text-red-dim hover:text-red p-1 rounded transition-colors disabled:opacity-0"
                                    >
                                        <X size={12} weight="bold"/>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="p-5 flex flex-col gap-5">
            
            {/* Active Fleet Section */}
            <div className="bg-black/20 border border-border rounded-md p-3">
                <div className="font-mono text-[9px] tracking-[3px] uppercase text-text-lo mb-3 flex items-center gap-2">
                    Active Fleet Allocation <span className="flex-1 h-px bg-border/50"></span>
                </div>
                
                <div className="flex flex-col gap-2 mb-3">
                {fleets.map((fleet) => (
                    <div 
                    key={fleet.id}
                    className="p-2 bg-black/30 border border-border hover:border-accent/50 rounded flex items-center gap-3 group transition-all"
                    >
                    <div className="w-8 h-8 rounded bg-accent/5 flex items-center justify-center text-accent shrink-0">
                        <Airplane size={18} weight={fleet.type === 'Rotary' ? 'duotone' : 'fill'} className={fleet.type === 'Rotary' ? 'rotate-[-45deg]' : ''} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-text-hi leading-tight truncate">{fleet.name}</div>
                        <div className="font-mono text-[9px] text-text-lo flex items-center gap-2 mt-0.5">
                        <span className="bg-border/20 px-1 rounded">{fleet.cap}</span>
                        <span className="text-accent flex items-center gap-1 ml-auto"><Drop weight="fill" size={8} /> {fleet.fuel} KG</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => removeFleet(fleet.id)}
                        className="p-1.5 text-red-dim hover:text-red hover:bg-red/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Trash size={14} />
                    </button>
                    </div>
                ))}
                </div>

                {/* Add Fleet Form */}
                <div className="flex gap-2 items-end p-2 rounded border border-border border-dashed bg-black/10">
                <div className="flex-1">
                    <label className="block font-mono text-[8px] text-text-lo mb-1 uppercase">Aircraft Type</label>
                    <select 
                    value={selectedAircraft}
                    onChange={(e) => setSelectedAircraft(e.target.value)}
                    className="w-full bg-black/40 border border-border text-text-hi font-mono text-[10px] rounded px-2 h-7 focus:border-accent focus:outline-none"
                    >
                    {AIRCRAFT_OPTIONS.map(opt => (
                        <option key={opt.name} value={opt.name}>{opt.name}</option>
                    ))}
                    </select>
                </div>
                <div className="w-20">
                    <label className="block font-mono text-[8px] text-text-lo mb-1 uppercase">Fuel (KG)</label>
                    <input 
                    type="number" 
                    placeholder="0" 
                    value={newFleetFuel}
                    onChange={(e) => setNewFleetFuel(e.target.value)}
                    className="w-full bg-black/40 border border-border text-text-hi font-mono text-[10px] px-2 h-7 rounded focus:border-accent focus:outline-none text-center placeholder-text-lo/50"
                    />
                </div>
                <button 
                    onClick={addFleet}
                    className="bg-accent/10 border border-accent/30 text-accent hover:bg-accent hover:text-black rounded w-7 h-7 flex items-center justify-center transition-colors"
                >
                    <Plus size={14} weight="bold" />
                </button>
                </div>
            </div>

            {/* Payload Section */}
            <div className="bg-black/20 border border-border rounded-md p-3 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                    <div className="font-mono text-[9px] tracking-[3px] uppercase text-text-lo">Payload Manifest</div>
                    <div className="font-mono text-[9px] text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">TOTAL: {totalWeight} KG</div>
                </div>
                
                <div className="overflow-hidden rounded border border-border mb-3 bg-black/30">
                <table className="w-full text-xs border-collapse table-fixed">
                    <thead className="bg-white/5 text-text-lo font-mono text-[9px]">
                    <tr>
                        <th className="text-left py-1.5 px-2 w-[40%] font-normal">ITEM</th>
                        <th className="text-center py-1.5 px-1 w-[30%] font-normal">ROUTE</th>
                        <th className="text-right py-1.5 px-2 w-[20%] font-normal">WGT</th>
                        <th className="w-[10%]"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {payloads.map((p) => (
                        <tr key={p.id} className="border-t border-border/40 hover:bg-white/5 group transition-colors">
                        <td className="py-2 px-2 text-text-hi font-semibold truncate">
                            <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                {p.isUrgent && <Warning weight="fill" className="text-red shrink-0" size={10} />}
                                <span className="truncate">{p.item}</span>
                            </div>
                            {p.isUrgent && <span className="text-[8px] font-mono text-red tracking-wider">URGENT</span>}
                            </div>
                        </td>
                        <td className="py-2 px-1 text-center truncate">
                            <div className="font-mono text-[9px] text-text-lo flex items-center justify-center gap-1">
                            <span className="truncate max-w-[40px]">{p.origin}</span> 
                            <ArrowRight size={8} className="shrink-0" /> 
                            <span className="truncate max-w-[40px]">{p.dest}</span>
                            </div>
                        </td>
                        <td className="py-2 px-2 font-mono text-right text-text">{p.weight}</td>
                        <td className="pr-1 text-center">
                            <button 
                            onClick={() => removePayload(p.id)}
                            className="text-text-lo hover:text-red transition-colors opacity-0 group-hover:opacity-100"
                            >
                            <X size={12} />
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>

                {/* Add Payload Form */}
                <div className="mt-auto bg-black/10 border border-border border-dashed rounded p-2">
                <div className="grid grid-cols-[1.5fr_1fr] gap-2 mb-2">
                    <div>
                        <label className="block font-mono text-[8px] text-text-lo mb-1 uppercase">Item Name</label>
                        <input 
                        type="text" 
                        placeholder="CARGO..." 
                        value={pItem}
                        onChange={(e) => setPItem(e.target.value)}
                        className="w-full bg-black/40 border border-border text-text-hi font-mono text-[10px] px-2 h-7 rounded focus:border-accent focus:outline-none placeholder-text-lo/50"
                        />
                    </div>
                    <div>
                        <label className="block font-mono text-[8px] text-text-lo mb-1 uppercase">Weight (KG)</label>
                        <input 
                        type="number" 
                        placeholder="0" 
                        value={pWeight}
                        onChange={(e) => setPWeight(e.target.value)}
                        className="w-full bg-black/40 border border-border text-text-hi font-mono text-[10px] px-2 h-7 rounded focus:border-accent focus:outline-none placeholder-text-lo/50"
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end mb-2">
                    <div>
                        <label className="block font-mono text-[8px] text-text-lo mb-1 uppercase">Origin</label>
                        <input 
                        type="text" 
                        placeholder="FROM" 
                        value={pOrigin}
                        onChange={(e) => setPOrigin(e.target.value)}
                        className="w-full bg-black/40 border border-border text-text-hi font-mono text-[10px] px-2 h-7 rounded focus:border-accent focus:outline-none placeholder-text-lo/50"
                        />
                    </div>
                    <div className="text-text-lo pb-2"><ArrowRight size={12}/></div>
                    <div>
                        <label className="block font-mono text-[8px] text-text-lo mb-1 uppercase">Destination</label>
                        <input 
                        type="text" 
                        placeholder="TO" 
                        value={pDest}
                        onChange={(e) => setPDest(e.target.value)}
                        className="w-full bg-black/40 border border-border text-text-hi font-mono text-[10px] px-2 h-7 rounded focus:border-accent focus:outline-none placeholder-text-lo/50"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-2 border-t border-border/30">
                    <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-3 h-3 border rounded-sm flex items-center justify-center transition-colors ${pIsUrgent ? 'bg-red border-red' : 'border-text-lo group-hover:border-red'}`}>
                        {pIsUrgent && <Check weight="bold" className="text-black text-[10px]" />}
                    </div>
                    <span className={`font-mono text-[9px] uppercase tracking-wider ${pIsUrgent ? 'text-red' : 'text-text-lo group-hover:text-red'}`}>Urgent Cargo</span>
                    <input type="checkbox" className="hidden" checked={pIsUrgent} onChange={(e) => setPIsUrgent(e.target.checked)} />
                    </label>

                    <button 
                    onClick={addPayload}
                    className="bg-green/10 border border-green/30 text-green hover:bg-green hover:text-black rounded px-3 py-1 transition-colors text-[10px] font-bold tracking-wider uppercase flex items-center gap-1"
                    >
                     <Plus size={10} weight="bold"/> ADD UNIT
                    </button>
                </div>
                </div>
            </div>

          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-border bg-black/40">
            <button 
              onClick={onNext}
              className="w-full py-3 bg-gradient-to-br from-[#003366] to-[#0055aa] border border-accent2 rounded-md text-accent font-orbitron text-[11px] font-bold tracking-[3px] uppercase flex items-center justify-center gap-2 hover:from-[#004488] hover:to-[#0066cc] hover:shadow-[0_0_20px_rgba(0,100,200,0.3)] hover:-translate-y-px transition-all"
            >
              Analyze Mission <ArrowRight weight="bold" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Phase1;