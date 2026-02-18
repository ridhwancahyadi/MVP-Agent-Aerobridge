import React from 'react';
import { TerminalWindow, Hexagon, CheckSquareOffset } from '@phosphor-icons/react';

interface PhaseNavProps {
  currentPhase: number;
  unlockedPhases: Set<number>;
  onPhaseChange: (phase: number) => void;
}

const PhaseNav: React.FC<PhaseNavProps> = ({ currentPhase, unlockedPhases, onPhaseChange }) => {
  const phases = [
    { id: 1, label: 'Command Input', icon: TerminalWindow },
    { id: 2, label: 'Mission Analysis', icon: Hexagon },
    { id: 3, label: 'Execution Plan', icon: CheckSquareOffset },
  ];

  return (
    <div className="fixed top-[52px] left-0 right-0 bg-panel/95 backdrop-blur-sm border-b border-border-hi grid grid-cols-3 z-[199]">
      {phases.map((phase) => {
        const isActive = currentPhase === phase.id;
        const isUnlocked = unlockedPhases.has(phase.id);
        const Icon = phase.icon;

        return (
          <div
            key={phase.id}
            onClick={() => onPhaseChange(phase.id)}
            className={`
              relative p-3 flex flex-col gap-0.5 cursor-pointer transition-all border-r border-border last:border-r-0
              ${isActive ? 'bg-accent/5' : ''}
              ${!isUnlocked ? 'opacity-25 cursor-not-allowed' : 'hover:bg-accent/5'}
            `}
          >
            <div className="font-mono text-[9px] text-text-lo tracking-[3px]">PHASE 0{phase.id}</div>
            <div className={`font-sans text-[13px] font-bold tracking-widest uppercase flex items-center gap-2 ${isActive ? 'text-accent' : 'text-text'}`}>
               <Icon size={14} weight={isActive ? "bold" : "regular"} /> {phase.label}
            </div>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent shadow-[0_0_8px_var(--accent)]" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PhaseNav;