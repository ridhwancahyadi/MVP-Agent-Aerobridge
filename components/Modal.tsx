import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, icon, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[1000] flex items-center justify-center p-4">
      <div className="bg-surface2 border border-green shadow-[0_0_40px_rgba(57,255,122,0.15)] rounded-xl p-10 max-w-md w-full text-center animate-[fadeUp_0.4s_ease]">
        <div className="flex justify-center">
            {icon}
        </div>
        <div className="font-orbitron text-lg font-black text-green tracking-[3px] mb-2">
          {title}
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;