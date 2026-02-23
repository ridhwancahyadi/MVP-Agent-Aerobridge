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

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] divide-y lg:divide-y-0 lg:divide-x divide-border">
          
          {/* Left: Orders & Timeline */}
          <div className="p-5">
            <div className="font-mono text-[9px] tracking-[3px] uppercase text-text-lo mb-2.5 flex items-center gap-2">
              Execution Orders <span className="flex-1 h-px bg-border"></span>
            </div>
            
            <div className="flex flex-col gap-3 mb-6">
              <div className="p-4 bg-black/30 border border-border rounded-md relative overflow-hidden pl-4 border-l-0">
                <div className="absolute top-0 left-0 w-1 h-full bg-green"></div>
                <div className="flex justify-between items-center mb-3">
                  <div className="font-mono text-[9px] text-text-lo tracking-widest">MISSION ORDER</div>
                  <div className="font-mono text-[9px] px-2 py-0.5 rounded uppercase tracking-wider bg-green/10 text-green border border-green/25 flex items-center gap-1">
                    <Check size={10} weight="bold" /> PASS
                  </div>
                </div>
                
                {/* Highlighted Fleet */}
                <div className="flex items-center gap-3 mb-4 p-2.5 bg-accent/10 border border-accent/20 rounded">
                    <div className="p-2 bg-accent/20 rounded text-accent">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M240,112a8,8,0,0,1-8,8H205.1l-14.9,29.8A16.1,16.1,0,0,1,175.9,160H80.1a16.1,16.1,0,0,1-14.3-9.2L50.9,112H24A8,8,0,0,1,24,96H56V64a8,8,0,0,1,16,0V96h64V64a8,8,0,0,1,16,0V96h48a8,8,0,0,1,0,16Zm-69.7,32,12-24H73.7l12,24ZM24,136a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V144A8,8,0,0,0,24,136Zm208,0a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V144A8,8,0,0,0,232,136ZM128,32a8,8,0,0,0-8-8H40a8,8,0,0,0,0,16h80A8,8,0,0,0,128,32Zm88-8H144a8,8,0,0,0,0,16h72a8,8,0,0,0,0-16Z"></path>
                        </svg>
                    </div>
                    <div>
                        <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-0.5">Assigned Fleet</div>
                        <div className="text-xl font-bold text-text-hi tracking-wide font-orbitron">EC725 CARACAL</div>
                    </div>
                </div>

                <div className="text-[13px] font-bold text-text-hi mb-4 flex items-center gap-2 pl-1">
                    <span className="text-text-lo font-normal text-[11px] font-mono uppercase tracking-wide">Route Sequence:</span> 
                    <span className="bg-black/40 px-2 py-0.5 rounded border border-border">WAYL</span> 
                    <ArrowLeft size={12} className="rotate-180 text-text-lo"/> 
                    <span className="bg-black/40 px-2 py-0.5 rounded border border-border">WABS</span>
                </div>

                <div className="space-y-2">
                    <div className="font-mono text-[9px] text-text-lo uppercase tracking-wider border-b border-border/30 pb-1 mb-2">Key Constraints & Directives</div>
                    {[
                      "Ketinggian lokasi WAYL dan WABS tinggi.",
                      "Margin bahan bakar ketat.",
                      "Ketersediaan bahan bakar terbatas."
                    ].map((constraint, i) => (
                        <div key={i} className="flex items-start gap-2 text-[10px] text-text bg-yellow/5 p-2 rounded border border-yellow/10">
                            <Warning size={14} className="text-yellow mt-0.5 shrink-0"/>
                            <span>{constraint}</span>
                        </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="font-mono text-[9px] tracking-[3px] uppercase text-text-lo mb-2.5 flex items-center gap-2">
              Mission Timeline (Est) <span className="flex-1 h-px bg-border"></span>
            </div>
            
            <div className="flex flex-col">
              {[
                { t: '06:00', c: 'bg-accent shadow-[0_0_5px_var(--accent)]', txt: 'Gusimawa DEPARTURE', sub: 'Temp 25°C · Wind 5kt', tc: 'text-accent' },
                { t: '06:45', c: 'bg-green shadow-[0_0_5px_var(--green)]', txt: 'Arr ILAGA (Stop 1)', sub: 'Drop 100kg · Quick Turn', tc: 'text-green' },
                { t: '07:15', c: 'bg-accent shadow-[0_0_5px_var(--accent)]', txt: 'Ilaga DEPARTURE', sub: 'Verify Sinak Weather', tc: 'text-accent' },
                { t: '07:35', c: 'bg-green shadow-[0_0_5px_var(--green)]', txt: 'Arr SINAK (Dest)', sub: 'Drop 100kg · Mission Complete', tc: 'text-green' },
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
                  { k: 'Strategy', v: 'Minimum Legal', c: 'text-green' },
                  { k: 'Mission ID', v: 'OPS-PAPUA-001', c: 'text-text-hi' },
                  { k: 'Asset', v: 'EC725 Caracal', c: 'text-text-hi' },
                  { k: 'Total Payload', v: '200 kg', c: 'text-text-hi' },
                  { k: 'Route', v: 'Gusimawa → Ilaga → Sinak', c: 'text-text-hi' },
                  { k: 'Fuel Req', v: '~1300 kg', c: 'text-yellow' },
                  { k: 'Max Dens Alt', v: 'High (Ilaga/Sinak)', c: 'text-yellow' },
                  { k: 'Safety Score', v: 'Stable', c: 'text-green' },
                  { k: 'AI Confidence', v: 'High', c: 'text-text-lo' },
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
                PILOT ADVISORY: Route traverses high terrain. Weather in highlands can change rapidly. Ensure visual contact with ground for approaches at Ilaga and Sinak.
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
              Ops Center Gusimawa · EC725 Crew · Ilaga Base
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Phase3;