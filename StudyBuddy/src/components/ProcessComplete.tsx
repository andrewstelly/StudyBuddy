import React, { useEffect } from 'react';
import './ProcessComplete.css';

interface ProcessCompleteProps {
  onComplete: () => void;
}

const ProcessComplete: React.FC<ProcessCompleteProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000); // Display for 2 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="process-complete-overlay">
      <div className="process-complete-message">
        Process Complete!
      </div>
    </div>
  );
};

export default ProcessComplete;