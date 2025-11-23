import React, { useState } from 'react';
import { Button } from './Button';

interface OnboardingViewProps {
  onComplete: (name: string) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (step === 1) {
      if (name.trim().length < 2) {
        setError('Please enter a valid name (at least 2 letters)');
        return;
      }
      setStep(2);
      setError('');
    } else {
      onComplete(name);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-duo-bg flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 transition-colors">
      
      {/* Branding / Logo */}
      <div className="mb-12 flex flex-col items-center">
        <div className="text-9xl mb-4 animate-float filter drop-shadow-xl">🦉</div>
        <h1 className="text-5xl font-fredoka font-extrabold tracking-tight text-duo-green mb-1">codulingo</h1>
        <p className="text-duo-text-sub font-bold tracking-widest uppercase text-sm">Learn to code for free</p>
      </div>

      {step === 1 ? (
        <div className="w-full max-w-sm space-y-6">
          <h2 className="text-3xl font-fredoka font-bold text-duo-text mb-2">
            Hi there! 👋
          </h2>
          <p className="text-duo-text-sub text-lg font-medium">
            I'm Duo-Code. I will teach you the language of computers. 
            <br/>
            What is your name?
          </p>

          <div className="relative">
            <input 
              type="text" 
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Your Name"
              className="w-full bg-duo-gray-light border-2 border-duo-gray focus:border-duo-green text-duo-text text-center text-2xl font-bold py-4 rounded-2xl outline-none transition-all placeholder:text-duo-text-sub/50"
              autoFocus
            />
            {error && <p className="text-duo-red text-sm mt-2 font-bold animate-pulse">{error}</p>}
          </div>

          <Button onClick={handleNext} variant="primary" fullWidth size="lg">
            CONTINUE
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-6 animate-in slide-in-from-right duration-300">
          <h2 className="text-3xl font-fredoka font-bold text-duo-text mb-2">
            Nice to meet you, <span className="text-duo-green">{name}</span>!
          </h2>
          <p className="text-duo-text-sub text-lg font-medium">
            We are going to learn **HTML**. It is the skeleton of the internet.
            <br/><br/>
            Are you ready to write your first line of code?
          </p>

          <div className="bg-duo-card p-4 rounded-2xl border-2 border-duo-gray mb-4 shadow-sm">
             <div className="flex items-center space-x-3 text-left">
                <div className="bg-duo-blue-accent/10 p-3 rounded-xl">
                    <span className="text-3xl">🚀</span>
                </div>
                <div>
                    <h3 className="font-extrabold text-duo-text text-lg">Your Goal</h3>
                    <p className="text-sm text-duo-text-sub font-bold">Learn HTML Basics</p>
                </div>
             </div>
          </div>

          <Button onClick={handleNext} variant="primary" fullWidth size="lg">
            LET'S GO!
          </Button>
        </div>
      )}
    </div>
  );
};