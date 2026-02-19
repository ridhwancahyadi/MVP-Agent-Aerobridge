import React, { useState, useEffect } from 'react';
import { Warning, CheckCircle, Clock } from '@phosphor-icons/react';
import TopBar from './components/TopBar';
import PhaseNav from './components/PhaseNav';
import Phase1 from './components/Phase1';
import Phase2 from './components/Phase2';
import Phase3 from './components/Phase3';
import Modal from './components/Modal';

const App: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [unlockedPhases, setUnlockedPhases] = useState<Set<number>>(new Set([1]));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePhaseChange = (phase: number) => {
    if (unlockedPhases.has(phase)) {
      setCurrentPhase(phase);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const unlockNextPhase = (nextPhase: number) => {
    setUnlockedPhases(prev => new Set(prev).add(nextPhase));
    handlePhaseChange(nextPhase);
  };

  const handleReset = () => {
    setUnlockedPhases(new Set([1]));
    setCurrentPhase(1);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen text-text font-sans relative">
      {/* Background Effects */}
      <div className="fixed inset-0 scanlines z-50 pointer-events-none"></div>
      <div className="fixed inset-0 grid-bg z-0 pointer-events-none"></div>

      <TopBar currentTime={currentTime} />
      
      <main className="relative z-10 pt-[70px] pb-20 px-4 max-w-7xl mx-auto">
        <PhaseNav 
          currentPhase={currentPhase} 
          unlockedPhases={unlockedPhases} 
          onPhaseChange={handlePhaseChange} 
        />

        {currentPhase === 1 && <Phase1 onNext={() => unlockNextPhase(2)} />}
        {currentPhase === 2 && (
          <Phase2 
            onBack={() => handlePhaseChange(1)} 
            onNext={() => unlockNextPhase(3)} 
          />
        )}
        {currentPhase === 3 && (
          <Phase3 
            onBack={() => handlePhaseChange(2)} 
            onExecute={() => setIsModalOpen(true)} 
          />
        )}
      </main>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleReset} 
        title="MISSION LAUNCHED"
        icon={<CheckCircle size={52} weight="fill" className="text-green mb-4" />}
      >
        <div className="text-center font-mono text-xs text-text-lo tracking-wider leading-relaxed">
          <p className="mb-2">ORDERS TRANSMITTED TO ALL UNITS</p>
          <p className="mb-2 text-accent">DEMO-001 · AEROMIND TRACKING ACTIVE</p>
          <p>EC725 CARACAL CLEARED FOR DEPARTURE</p>
        </div>
        <button 
          onClick={handleReset}
          className="mt-8 px-8 py-3 bg-green text-black font-orbitron text-xs font-black tracking-widest rounded hover:bg-[#50ff90] hover:shadow-[0_0_20px_rgba(57,255,122,0.4)] transition-all duration-200"
        >
          NEW MISSION
        </button>
      </Modal>
    </div>
  );
};

export default App;