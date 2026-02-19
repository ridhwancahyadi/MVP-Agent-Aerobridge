import React from 'react';
import { AirplaneTilt, WarningCircle, CheckCircle } from '@phosphor-icons/react';

interface TopBarProps {
  currentTime: string;
}

const TopBar: React.FC<TopBarProps> = ({ currentTime }) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-[52px] bg-bg/95 backdrop-blur-sm border-b border-border-hi z-[200]">
      <div className="max-w-5xl mx-auto w-full h-full px-4 flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] bg-gradient-to-br from-[#003344] to-[#006688] border border-accent2 rounded-md flex items-center justify-center text-accent">
            <AirplaneTilt size={20} weight="fill" />
          </div>
          <div>
            <div className="font-orbitron text-[15px] font-black text-accent tracking-[3px] leading-none">
              AEROMIND <span className="text-white font-normal">TACTICAL</span>
            </div>
            <div className="font-mono text-[9px] text-text-lo tracking-[2px] mt-0.5">
              AUTO-INTEL OPS PLANNER v9.2 · CLASSIFIED
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-5">
          <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest">
            <div className="w-[7px] h-[7px] rounded-full bg-red shadow-[0_0_6px_var(--red)] animate-pulse-fast"></div>
            <span className="text-red flex items-center gap-1">THREAT ACTIVE <WarningCircle size={12} /></span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest hidden sm:flex">
            <div className="w-[7px] h-[7px] rounded-full bg-green shadow-[0_0_6px_var(--green)] animate-pulse-fast"></div>
            <span className="text-green flex items-center gap-1">SYSTEM ONLINE <CheckCircle size={12} /></span>
          </div>
          <div className="font-mono text-xs text-yellow tracking-widest border border-border-hi px-2.5 py-1 rounded bg-yellow/5">
            {currentTime || '--:--:--'} LT
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;