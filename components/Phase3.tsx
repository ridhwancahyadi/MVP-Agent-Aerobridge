import React from 'react';
import { ArrowLeft, Check, Warning, FileText, PaperPlaneRight } from '@phosphor-icons/react';

interface Phase3Props {
  onBack: () => void;
  onExecute: () => void;
}

const Phase3: React.FC<Phase3Props> = ({ onBack, onExecute }) => {
  return (
    <div className="animate-[fadeUp_0.3s_ease]">
      <div className="bg-panel border border-border-hi rounded-lg overflow-hidden relative">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-accent rounded-tl-lg z-10"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-accent rounded-br-lg z-10"></div>

        {/* Header */}
        <div className="p-5 border-b border-border flex justify-between items-start bg-accent/5">
          <div>
            <div className="font-orbitron text-base font-bold text-text-hi tracking-widest uppercase">Execution Plan</div>
            <div className="font-mono text-[10px] text-text-lo mt-1 tracking-wider">// MISSION MANIFESTO GENERATED · PILOT BRIEFING READY</div>
          </div>
          <div className="font-mono text-[9px] text-green text-right tracking-widest">
            MANIFESTO: DEMO-001<br />GENERATED: T+0
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] divide-y lg:divide-y-0 lg:divide-x divide-border">
          
          {/* Left: Orders & Timeline */}
          <div className="p-5">
            <div className="font-mono text-[9px] tracking-[3px] uppercase text-text-lo mb-2.5 flex items-center gap-2">
              Execution Orders <span className="flex-1 h-px bg-border"></span>
            </div>
            
            <div className="flex flex-col gap-3 mb-6">
              <div className="p-4 bg-black/30 border border-border rounded-md relative overflow-hidden pl-4 border-l-0">
                <div className="absolute top-0 left-0 w-1 h-full bg-red"></div>
                <div className="flex justify-between items-center mb-2">
                  <div className="font-mono text-[9px] text-text-lo tracking-widest">ORD-001 / TIMIKA → WAMENA</div>
                  <div className="font-mono text-[9px] px-2 py-0.5 rounded uppercase tracking-wider bg-green/10 text-green border border-green/25 flex items-center gap-1">
                    <Check size={10} weight="bold" /> APPROVED
                  </div>
                </div>
                <div className="text-[15px] font-bold text-text-hi mb-1">🚁 Minimize OGE Hover</div>
                <div className="font-mono text-[10px] text-text-lo mb-2">High density altitude (6,678 ft). Min Margin 0.14. Perform rapid transitions.</div>
                <div className="flex flex-wrap gap-2">
                  <span className="font-mono text-[10px] px-2 py-0.5 bg-black/30 border border-border rounded text-text">Payload: 500kg</span>
                </div>
              </div>

              <div className="p-4 bg-black/30 border border-border rounded-md relative overflow-hidden pl-4 border-l-0">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow"></div>
                <div className="flex justify-between items-center mb-2">
                  <div className="font-mono text-[9px] text-text-lo tracking-widest">ORD-002 / WAMENA → ILAGA</div>
                  <div className="font-mono text-[9px] px-2 py-0.5 rounded uppercase tracking-wider bg-yellow/10 text-yellow border border-yellow/25 flex items-center gap-1">
                    <Warning size={10} weight="bold" /> CHECK VIS
                  </div>
                </div>
                <div className="text-[15px] font-bold text-text-hi mb-1">🚁 Verify Visibility {'>'} 5km</div>
                <div className="font-mono text-[10px] text-text-lo mb-2">Alt: 9,277 ft. Fuel Reserve critical. Do not depart if vis {'<'} 5km.</div>
                <div className="flex flex-wrap gap-2">
                   <span className="font-mono text-[10px] px-2 py-0.5 bg-black/30 border border-border rounded text-text">Payload: 200kg</span>
                </div>
              </div>
            </div>

            <div className="font-mono text-[9px] tracking-[3px] uppercase text-text-lo mb-2.5 flex items-center gap-2">
              Mission Timeline (Early Dept) <span className="flex-1 h-px bg-border"></span>
            </div>
            
            <div className="flex flex-col">
              {[
                { t: '06:00', c: 'bg-accent shadow-[0_0_5px_var(--accent)]', txt: 'Timika DEPARTURE', sub: 'Temp 28°C · Wind 3kt', tc: 'text-accent' },
                { t: '06:54', c: 'bg-green shadow-[0_0_5px_var(--green)]', txt: 'Arr WAMENA (Stop 1)', sub: 'Drop 300kg · Hot Turnaround', tc: 'text-green' },
                { t: '07:30', c: 'bg-accent shadow-[0_0_5px_var(--accent)]', txt: 'Wamena DEPARTURE', sub: 'Verify Ilaga Weather', tc: 'text-accent' },
                { t: '08:05', c: 'bg-green shadow-[0_0_5px_var(--green)]', txt: 'Arr ILAGA (Dest)', sub: 'Drop 200kg · Mission Complete', tc: 'text-green' },
              ].map((ev, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                  <div className={`font-mono text-[10px] w-12 shrink-0 ${ev.tc}`}>{ev.t}</div>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${ev.c}`}></div>
                  <div>
                    <div className="text-xs text-text">{ev.txt}</div>
                    <div className="font-mono text-[10px] text-text-lo">{ev.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button onClick={onBack} className="px-4 py-2 bg-transparent border border-border-hi rounded text-text-lo font-mono text-[10px] hover:text-text hover:border-text-lo transition-colors flex items-center gap-2">
                <ArrowLeft /> BACK TO ANALYSIS
              </button>
            </div>
          </div>

          {/* Right: Summary & Action */}
          <div className="p-5">
            <div className="bg-green/5 border border-green/20 rounded-lg p-5 mb-4">
              <div className="font-orbitron text-[11px] text-green tracking-[3px] uppercase mb-3 flex items-center gap-2">
                <FileText size={16} /> Mission Manifesto Summary
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { k: 'Strategy', v: 'Early Departure (06:00)', c: 'text-green' },
                  { k: 'Mission ID', v: 'DEMO-001', c: 'text-text-hi' },
                  { k: 'Asset', v: 'EC725 Caracal', c: 'text-text-hi' },
                  { k: 'Total Payload', v: '500 kg', c: 'text-text-hi' },
                  { k: 'Route', v: 'Timika → Wamena → Ilaga', c: 'text-text-hi' },
                  { k: 'Fuel Req', v: '1109 kg', c: 'text-yellow' },
                  { k: 'Max Dens Alt', v: '9,277 ft (Ilaga)', c: 'text-yellow' },
                  { k: 'Safety Score', v: '0.61 (Pass)', c: 'text-yellow' },
                  { k: 'AI Confidence', v: 'Medium', c: 'text-text-lo' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center text-[13px] border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-text font-medium text-xs">{row.k}</span>
                    <span className={`font-mono text-[11px] ${row.c}`}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-orange/5 border border-orange/25 rounded-md p-3 mb-4 flex items-start gap-3">
              <Warning size={18} className="text-orange shrink-0 mt-0.5" />
              <div className="font-mono text-[10px] text-orange leading-relaxed tracking-wide">
                PILOT ADVISORY: Weakest leg is Timika → Wamena (Low OGE Buffer). Ilaga approach requires caution due to high density altitude. Confirm visibility {'>'} 5km before Leg 2 departure.
              </div>
            </div>

            <button 
              onClick={onExecute}
              className="w-full py-4 bg-gradient-to-br from-[#003300] to-[#006622] border border-green2 rounded-md text-green font-orbitron text-xs font-bold tracking-[3px] uppercase flex items-center justify-center gap-2.5 hover:from-[#004400] hover:to-[#008833] hover:shadow-[0_0_24px_rgba(0,180,60,0.25)] hover:-translate-y-px transition-all"
            >
              <PaperPlaneRight size={16} weight="bold" /> CONFIRM & EXECUTE MISSION
            </button>

            <div className="mt-3 text-center font-mono text-[9px] text-text-lo tracking-wide leading-relaxed">
              MANIFESTO WILL BE TRANSMITTED TO:<br />
              Ops Center Timika · EC725 Crew · Wamena Base
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Phase3;