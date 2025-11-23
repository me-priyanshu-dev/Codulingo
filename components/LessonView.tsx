
import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Check, AlertCircle, Gem, Trophy, Heart, Play, RotateCcw, Loader2 } from 'lucide-react';
import { Level, LessonSegment, QuestionType, CharacterType } from '../types';
import { Button } from './Button';
import { getTutorHelp } from '../services/geminiService';

interface LessonViewProps {
  level: Level;
  onComplete: (score: number) => void;
  onExit: () => void;
  loseHeart: () => void;
  hearts: number;
}

export const LessonView: React.FC<LessonViewProps> = ({ level, onComplete, onExit, loseHeart, hearts }) => {
  const [segmentQueue, setSegmentQueue] = useState<number[]>(level.segments.map((_, i) => i));
  const [queueIndex, setQueueIndex] = useState(0);
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [rearrangeOrder, setRearrangeOrder] = useState<string[]>([]);
  const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'INCORRECT' | 'TRY_AGAIN' | 'FINISHED'>('IDLE');
  const [tutorMessage, setTutorMessage] = useState<string | null>(null);
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  
  const [attempts, setAttempts] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  const [leftCol, setLeftCol] = useState<{id: string, text: string}[]>([]);
  const [rightCol, setRightCol] = useState<{id: string, text: string}[]>([]);

  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [visualSnippetRun, setVisualSnippetRun] = useState(false);

  const sounds = {
    pop: new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3'),
    correct: new Audio('https://commondatastorage.googleapis.com/codeskulptor-assets/week7-brrring.m4a'),
    wrong: new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/explosion_02.wav'),
    win: new Audio('https://commondatastorage.googleapis.com/codeskulptor-assets/week7-brrring.m4a'),
    match: new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/arrow.mp3'),
  };

  const currentRealIndex = segmentQueue[queueIndex];
  const currentSegment: LessonSegment = level.segments[currentRealIndex];
  const progress = (queueIndex / segmentQueue.length) * 100;

  // --- Character Styling (Vibrant Theme) ---
  const getCharacterAvatar = (char?: CharacterType) => {
    switch (char) {
        case 'robot': return '🤖';
        case 'cat': return '😸';
        case 'bug': return '👾'; 
        default: return '🦉';
    }
  };

  const getBubbleStyle = (char?: CharacterType) => {
      // Cleaner bubbles for Duolingo style
      return 'bg-white border-2 border-duo-gray shadow-md rounded-2xl';
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  useEffect(() => {
    setDisplayedContent('');
    setIsTyping(true);
    setSelectedOption(null);
    setRearrangeOrder([]);
    setStatus('IDLE');
    setTutorMessage(null);
    setAttempts(0);
    setMatchedPairs([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setVisualSnippetRun(false); 
    
    if (currentSegment.type === 'CHALLENGE' && currentSegment.question?.options) {
        setShuffledOptions(shuffleArray(currentSegment.question.options));
    }

    if (currentSegment.type === 'CHALLENGE' && currentSegment.question?.type === QuestionType.MATCHING && currentSegment.question.pairs) {
        const pairs = currentSegment.question.pairs;
        const lefts = pairs.map(p => ({ id: p.id, text: p.left }));
        const rights = pairs.map(p => ({ id: p.id, text: p.right }));
        setLeftCol(shuffleArray(lefts));
        setRightCol(shuffleArray(rights));
    }
    
    if (currentSegment.type === 'EXPLANATION' && currentSegment.content) {
      let index = 0;
      const fullText = currentSegment.content;
      const typeChar = () => {
        if (index < fullText.length) {
          setDisplayedContent(fullText.slice(0, index + 1));
          index++;
          typingTimeoutRef.current = setTimeout(typeChar, 20);
        } else {
          setIsTyping(false);
        }
      };
      typeChar();
    } else {
        setIsTyping(false);
        setDisplayedContent('');
    }
    
    return () => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [queueIndex, currentRealIndex]); 

  const playSound = (audio: HTMLAudioElement) => {
    audio.currentTime = 0;
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  const skipTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (currentSegment.content) setDisplayedContent(currentSegment.content);
    setIsTyping(false);
  };

  const handleCheck = () => {
    if (currentSegment.type === 'EXPLANATION') {
        if (isTyping) skipTyping();
        else handleNext();
        return;
    }

    const question = currentSegment.question;
    if (!question) return;

    let isCorrect = false;
    
    if (question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.FILL_BLANK) {
      isCorrect = selectedOption === question.correctAnswer;
    } else if (question.type === QuestionType.REARRANGE) {
      isCorrect = JSON.stringify(rearrangeOrder) === JSON.stringify(question.correctAnswer);
    } else if (question.type === QuestionType.MATCHING) {
        isCorrect = matchedPairs.length === (question.pairs?.length || 0);
    }

    if (isCorrect) {
      setStatus('CORRECT');
      playSound(sounds.correct);
    } else {
      if (attempts === 0) {
        setStatus('TRY_AGAIN');
        setAttempts(1);
        playSound(sounds.pop);
      } else {
        setStatus('INCORRECT');
        loseHeart();
        playSound(sounds.wrong);
        setSegmentQueue(prev => [...prev, currentRealIndex]);
      }
    }
  };

  const handleNext = () => {
    if (queueIndex < segmentQueue.length - 1) {
      setQueueIndex(prev => prev + 1);
      if (currentSegment.type === 'EXPLANATION') playSound(sounds.pop);
    } else {
      setStatus('FINISHED');
      playSound(sounds.win);
    }
  };

  const handleAskTutor = async () => {
    if (currentSegment.type !== 'CHALLENGE' || !currentSegment.question) return;
    setIsTutorLoading(true);
    const context = currentSegment.question.type === QuestionType.MATCHING 
        ? "I am stuck on matching."
        : selectedOption || JSON.stringify(rearrangeOrder) || "I don't know.";
    const help = await getTutorHelp(currentSegment.question.prompt, context);
    setTutorMessage(help);
    setIsTutorLoading(false);
  };

  const handleRearrangeClick = (option: string) => {
    if (rearrangeOrder.includes(option)) {
      setRearrangeOrder(prev => prev.filter(o => o !== option));
    } else {
      setRearrangeOrder(prev => [...prev, option]);
      playSound(sounds.pop);
    }
  };

  const handleMatchingClick = (side: 'left' | 'right', id: string) => {
    playSound(sounds.pop);
    if (side === 'left') {
        if (selectedLeft === id) setSelectedLeft(null);
        else setSelectedLeft(id);
    } else {
        if (selectedRight === id) setSelectedRight(null);
        else setSelectedRight(id);
    }
  };

  useEffect(() => {
    if (selectedLeft && selectedRight && currentSegment.question?.type === QuestionType.MATCHING) {
        if (selectedLeft === selectedRight) {
            setMatchedPairs(prev => [...prev, selectedLeft]);
            playSound(sounds.match);
            setSelectedLeft(null);
            setSelectedRight(null);
        } else {
            setTimeout(() => {
                setSelectedLeft(null);
                setSelectedRight(null);
                playSound(sounds.wrong);
            }, 400);
        }
    }
  }, [selectedLeft, selectedRight]);

  const renderVisualExplanation = (codeSnippet: string) => {
      return (
          <div className="w-full mt-4 bg-duo-gray-light rounded-2xl p-4 border-2 border-duo-gray relative overflow-hidden group">
              <div className="flex justify-between items-center mb-2 border-b-2 border-duo-gray pb-2">
                  <div className="flex space-x-1.5">
                      <div className="w-3 h-3 rounded-full bg-duo-red"></div>
                      <div className="w-3 h-3 rounded-full bg-duo-yellow"></div>
                      <div className="w-3 h-3 rounded-full bg-duo-green"></div>
                  </div>
                  <div className="text-xs font-bold text-duo-text-sub uppercase">Preview</div>
              </div>
              <div className="flex flex-col gap-4">
                  {codeSnippet && (
                      <div 
                        onClick={() => setVisualSnippetRun(true)}
                        className={`font-mono text-sm bg-white p-3 rounded-xl border-2 border-duo-gray text-duo-text cursor-pointer hover:bg-duo-gray-light transition-colors ${visualSnippetRun ? 'opacity-50' : 'opacity-100'}`}
                      >
                         {codeSnippet}
                      </div>
                  )}
                  <div className={`
                    bg-white text-slate-800 rounded-xl p-4 min-h-[60px] flex items-center justify-center transition-all duration-500 relative border-2 border-duo-gray
                    ${visualSnippetRun ? 'scale-100 opacity-100' : 'scale-95 opacity-50 grayscale'}
                  `}>
                      {!visualSnippetRun && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-xl backdrop-blur-[1px] z-10">
                              <Play className="text-duo-green drop-shadow-lg animate-pulse" size={32} fill="currentColor" />
                          </div>
                      )}
                      <div className="pointer-events-none select-none">
                         {/* Simple visual output simulation based on text content */}
                         {codeSnippet?.includes('b>') ? <b>Bold Text</b> : 
                          codeSnippet?.includes('h1') ? <h1 className="text-2xl font-bold">Big Title</h1> :
                          codeSnippet?.includes('button') ? <button className="bg-blue-500 text-white px-3 py-1 rounded">Button</button> :
                          codeSnippet?.includes('input') ? <div className="border p-1 rounded bg-white">Input Box</div> :
                          <span>Result View</span>
                         }
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderExplanationText = (text: string) => {
    return text.split('\n').map((line, i) => {
        if (line.trim().startsWith('•')) {
            return (
                <div key={i} className="flex items-start mb-2 ml-1">
                    <span className="text-duo-green mr-2 text-xl font-black">•</span>
                    <span>
                        {line.replace('•', '').trim().split('**').map((part, idx) => 
                            idx % 2 === 1 ? <span key={idx} className="font-bold text-duo-text-sub">{part}</span> : part
                        )}
                    </span>
                </div>
            );
        }
        if (line.trim() === '') return <div key={i} className="h-2"></div>;
        return (
            <p key={i} className="mb-2">
                {line.split('**').map((part, idx) => 
                    idx % 2 === 1 ? <span key={idx} className="font-bold text-duo-text-sub">{part}</span> : part
                )}
            </p>
        );
    });
  };

  if (hearts <= 0) {
    return (
        <div className="flex flex-col items-center justify-center h-[100dvh] p-6 text-center bg-duo-bg animate-in fade-in zoom-in duration-300">
            <div className="text-8xl mb-6 animate-pulse">💔</div>
            <h2 className="text-3xl font-fredoka font-extrabold text-duo-text mb-2">Out of Hearts!</h2>
            <p className="text-duo-text-sub text-lg mb-8 font-bold">You need to heal up before coding more.</p>
            <Button onClick={onExit} variant="primary" fullWidth size="lg">BACK TO HOME</Button>
        </div>
    )
  }

  if (status === 'FINISHED') {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-duo-bg p-6 animate-in zoom-in duration-300 text-center">
        <div className="mb-6 relative">
             <Trophy size={140} className="text-duo-yellow animate-bounce" fill="currentColor" />
             <div className="absolute top-0 left-0 w-full h-full animate-confetti"></div>
        </div>
        <h2 className="text-4xl font-fredoka font-extrabold text-duo-yellow mb-8 tracking-wider">LESSON COMPLETE!</h2>
        
        <div className="flex gap-4 mb-12 w-full max-w-sm">
            <div className="flex-1 bg-duo-card border-2 border-duo-gray p-4 rounded-2xl flex flex-col items-center shadow-lg">
                <span className="text-duo-text-sub font-bold text-xs uppercase mb-1">XP Gained</span>
                <span className="text-4xl font-black text-duo-yellow">+15</span>
            </div>
            <div className="flex-1 bg-duo-card border-2 border-duo-gray p-4 rounded-2xl flex flex-col items-center shadow-lg">
                <span className="text-duo-text-sub font-bold text-xs uppercase mb-1">Gems</span>
                 <div className="flex items-center space-x-1">
                    <Gem size={28} className="text-duo-blue-accent" fill="currentColor"/>
                    <span className="text-4xl font-black text-duo-blue-accent">+10</span>
                 </div>
            </div>
        </div>
        <Button onClick={() => onComplete(100)} variant="primary" fullWidth size="lg">CONTINUE</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-duo-bg max-w-2xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="px-4 py-6 flex items-center space-x-4 shrink-0">
        <button onClick={onExit} className="text-duo-text-sub hover:bg-duo-gray-light p-2 rounded-full transition-colors">
          <X size={28} strokeWidth={2.5} />
        </button>
        <div className="flex-1 h-4 bg-duo-gray-light rounded-full relative">
          <div 
            className="h-full bg-duo-green rounded-full transition-all duration-500 ease-out relative" 
            style={{ width: `${progress}%` }}
          >
             <div className="absolute top-1 right-2 w-full h-1 bg-white/30 rounded-full"></div>
          </div>
        </div>
        <div className="flex items-center text-duo-red font-bold mr-2">
            <Heart size={28} fill="currentColor" className="mr-2 animate-pulse"/>
            <span className="text-xl font-fredoka">{hearts === 999 ? '∞' : hearts}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        
        {/* EXPLANATION VIEW */}
        {currentSegment.type === 'EXPLANATION' && (
            <div className="flex flex-col items-center justify-center min-h-full py-6 animate-in slide-in-from-right duration-300">
                <div className="mb-6 animate-float cursor-pointer text-9xl">
                     {getCharacterAvatar(currentSegment.character)}
                </div>
                
                {/* Character Bubble */}
                <div className={`p-6 relative max-w-sm w-full transition-all duration-300 ${getBubbleStyle(currentSegment.character)}`}>
                     {/* Triangle pointer */}
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-t-2 border-l-2 border-duo-gray transform rotate-45"></div>

                     <h3 className="text-xl font-fredoka font-extrabold mb-3 text-duo-text">
                        {currentSegment.title}
                     </h3>
                     
                     <div className="text-lg leading-relaxed font-medium min-h-[80px] text-duo-text" onClick={skipTyping}>
                        {renderExplanationText(displayedContent)}
                     </div>

                     {!isTyping && currentSegment.codeSnippet && (
                         renderVisualExplanation(currentSegment.codeSnippet)
                     )}
                </div>

                <div className="mt-8 w-full max-w-sm">
                    <Button onClick={handleCheck} variant="primary" size="lg" fullWidth disabled={isTyping && displayedContent.length < 5}>
                        {isTyping ? 'SKIP' : 'GOT IT'}
                    </Button>
                </div>
            </div>
        )}

        {/* CHALLENGE VIEW */}
        {currentSegment.type === 'CHALLENGE' && currentSegment.question && (
            <div className="animate-in slide-in-from-right duration-300 py-4 pb-32">
                
                <h1 className="text-2xl font-fredoka font-extrabold text-duo-text mb-6">
                    {currentSegment.question.prompt}
                </h1>
                
                {/* Character Mini Avatar */}
                <div className="flex items-center mb-6">
                     <div className="text-6xl mr-4">
                        {getCharacterAvatar(currentSegment.character || 'owl')}
                     </div>
                     <div className="bg-white border-2 border-duo-gray p-3 rounded-xl rounded-tl-none shadow-sm text-duo-text font-bold">
                         Do this carefully!
                     </div>
                </div>

                {currentSegment.question.codeSnippet && (
                <div className="bg-duo-gray-light text-duo-text p-5 rounded-2xl font-mono text-lg mb-8 border-2 border-duo-gray relative overflow-hidden w-full">
                    <div className="relative z-10 break-words whitespace-pre-wrap leading-relaxed">
                    {currentSegment.question.codeSnippet.split('___').map((part, i, arr) => (
                        <React.Fragment key={i}>
                        <span>{part}</span>
                        {i < arr.length - 1 && (
                            <span className="bg-white border-b-2 border-duo-gray px-3 py-0.5 rounded mx-1 inline-block min-w-[60px] text-center font-bold text-duo-blue-accent">?</span>
                        )}
                        </React.Fragment>
                    ))}
                    </div>
                </div>
                )}

                <div className={`space-y-4 ${status === 'TRY_AGAIN' ? 'animate-shake' : ''}`}>
                
                {/* MULTIPLE CHOICE */}
                {currentSegment.question.type === QuestionType.MULTIPLE_CHOICE && (
                    <div className="grid grid-cols-1 gap-3">
                    {shuffledOptions.map((option, idx) => (
                        <div 
                        key={idx}
                        onClick={() => {
                            if (status === 'IDLE' || status === 'TRY_AGAIN') {
                                setSelectedOption(option);
                                playSound(sounds.pop);
                            }
                        }}
                        className={`
                            p-4 rounded-2xl border-2 border-b-4 cursor-pointer transition-all text-lg font-bold flex items-center
                            ${selectedOption === option 
                            ? 'bg-duo-blue-accent/10 border-duo-blue-accent text-duo-blue-accent' 
                            : 'bg-white border-duo-gray text-duo-text hover:bg-duo-gray-light active:border-b-2 active:translate-y-[2px]'
                            }
                        `}
                        >
                        <span className={`mr-4 border-2 rounded-lg px-2 py-0.5 text-sm font-extrabold
                            ${selectedOption === option ? 'border-duo-blue-accent text-duo-blue-accent' : 'border-duo-gray text-duo-text-sub'}
                        `}>{idx + 1}</span>
                        {option}
                        </div>
                    ))}
                    </div>
                )}

                {/* FILL BLANK */}
                {currentSegment.question.type === QuestionType.FILL_BLANK && (
                    <div className="grid grid-cols-2 gap-3">
                        {shuffledOptions.map((option, idx) => (
                        <Button 
                            key={idx}
                            variant={selectedOption === option ? 'secondary' : 'outline'}
                            onClick={() => {
                                if (status === 'IDLE' || status === 'TRY_AGAIN') {
                                    setSelectedOption(option);
                                    playSound(sounds.pop);
                                }
                            }}
                            className="text-lg normal-case font-mono"
                        >
                            {option}
                        </Button>
                        ))}
                    </div>
                )}

                {/* MATCHING */}
                {currentSegment.question.type === QuestionType.MATCHING && currentSegment.question.pairs && (
                    <div className="flex gap-4 justify-between">
                        <div className="flex-1 space-y-3">
                            {leftCol.map((item) => {
                                const isMatched = matchedPairs.includes(item.id);
                                const isSelected = selectedLeft === item.id;
                                if (isMatched) return <div key={item.id} className="h-16 opacity-0"></div>;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleMatchingClick('left', item.id)}
                                        className={`w-full p-2 rounded-xl border-2 border-b-4 font-bold transition-all text-sm h-16 flex items-center justify-center
                                            ${isSelected 
                                                ? 'bg-duo-blue-accent text-white border-duo-blue-dark'
                                                : 'bg-white border-duo-gray text-duo-text hover:bg-duo-gray-light'
                                            }
                                        `}
                                    >{item.text}</button>
                                );
                            })}
                        </div>
                         <div className="flex-1 space-y-3">
                            {rightCol.map((item) => {
                                const isMatched = matchedPairs.includes(item.id);
                                const isSelected = selectedRight === item.id;
                                if (isMatched) return <div key={item.id} className="h-16 opacity-0"></div>;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleMatchingClick('right', item.id)}
                                        className={`w-full p-2 rounded-xl border-2 border-b-4 font-bold transition-all text-sm h-16 flex items-center justify-center
                                            ${isSelected 
                                                ? 'bg-duo-blue-accent text-white border-duo-blue-dark'
                                                : 'bg-white border-duo-gray text-duo-text hover:bg-duo-gray-light'
                                            }
                                        `}
                                    >{item.text}</button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* REARRANGE */}
                {currentSegment.question.type === QuestionType.REARRANGE && (
                    <div className="space-y-8">
                    <div className="min-h-[80px] flex flex-wrap gap-2 p-4 bg-white rounded-2xl border-2 border-duo-gray items-center justify-start shadow-sm">
                        {rearrangeOrder.length === 0 && (
                            <span className="text-duo-text-sub text-base w-full text-center font-bold opacity-50">Tap words to build</span>
                        )}
                        {rearrangeOrder.map((option, idx) => (
                            <button
                            key={idx}
                            onClick={() => (status === 'IDLE' || status === 'TRY_AGAIN') && handleRearrangeClick(option)}
                            className="bg-white text-duo-text border-2 border-b-4 border-duo-gray px-3 py-2 rounded-xl font-mono text-lg font-bold hover:bg-red-50 active:scale-95 transition-all"
                            >
                            {option}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {shuffledOptions.map((option, idx) => {
                            const isSelected = rearrangeOrder.includes(option);
                            if (isSelected) return <div key={idx} className="w-20 h-12 opacity-0"></div>;
                            return (
                            <button
                                key={idx}
                                onClick={() => (status === 'IDLE' || status === 'TRY_AGAIN') && handleRearrangeClick(option)}
                                className="px-4 py-3 rounded-xl bg-white border-2 border-b-4 border-duo-gray text-duo-text hover:bg-duo-gray-light active:translate-y-1 active:border-b-2 font-mono text-base font-bold transition-all duration-200"
                            >
                                {option}
                            </button>
                            );
                        })}
                    </div>
                    </div>
                )}
                </div>
            </div>
        )}
      </div>

      {/* Footer */}
      {currentSegment.type === 'CHALLENGE' && (
        <div className={`
            fixed bottom-0 left-0 right-0 p-6 border-t-2 z-50
            ${status === 'CORRECT' ? 'bg-[#d7ffb8] border-[#b8f28b]' : 
              status === 'INCORRECT' ? 'bg-[#ffdfe0] border-[#ffc1c1]' : 
              status === 'TRY_AGAIN' ? 'bg-[#fff4ce] border-[#ffe8a5]' :
              'bg-duo-bg border-duo-gray'}
            max-w-2xl mx-auto transition-colors duration-300
        `}>
            <div className="flex justify-between items-center">
            {(status === 'IDLE' || status === 'TRY_AGAIN') && (
                <div className="flex-1 flex flex-col gap-2">
                    {status === 'TRY_AGAIN' && (
                        <div className="flex items-center text-duo-yellow-dark font-black mb-1 animate-pulse">
                            <AlertCircle className="mr-2" />
                            <span>Try that again!</span>
                        </div>
                    )}
                    <div className="flex gap-4">
                        <button 
                            onClick={handleAskTutor}
                            disabled={isTutorLoading}
                            className="flex items-center justify-center space-x-2 text-duo-blue-accent font-bold hover:bg-duo-blue-accent/10 px-4 py-3 rounded-2xl transition-colors border-2 border-transparent hover:border-duo-blue-accent/30"
                        >
                           {isTutorLoading ? <Loader2 className="animate-spin" /> : <MessageCircle size={32} />}
                        </button>
                        <Button 
                            onClick={handleCheck} 
                            variant="primary" 
                            disabled={!selectedOption && rearrangeOrder.length === 0 && matchedPairs.length < (currentSegment.question?.pairs?.length || 0)}
                            className="flex-1"
                            size="lg"
                        >
                            {status === 'TRY_AGAIN' ? 'RETRY' : 'CHECK'}
                        </Button>
                    </div>
                </div>
            )}
            
            {(status === 'CORRECT' || status === 'INCORRECT') && (
                <div className="w-full animate-in slide-in-from-bottom-5 duration-300">
                <div className="flex items-start mb-4 space-x-4">
                    <div className={`p-1 rounded-full bg-white border-2 ${status === 'CORRECT' ? 'border-duo-green' : 'border-duo-red'}`}>
                        {status === 'CORRECT' ? <Check size={32} className="text-duo-green"/> : <X size={32} className="text-duo-red"/>}
                    </div>
                    <div className="flex-1">
                    <h3 className={`font-extrabold text-2xl mb-1 ${status === 'CORRECT' ? 'text-duo-green' : 'text-duo-red'}`}>
                        {status === 'CORRECT' ? 'Nicely done!' : 'Correct Solution:'}
                    </h3>
                    
                    {status === 'INCORRECT' && currentSegment.question && (
                        <p className="text-base font-mono bg-white p-2 rounded-xl inline-block text-duo-red border-2 border-duo-red/20">
                            {Array.isArray(currentSegment.question.correctAnswer) 
                                ? currentSegment.question.correctAnswer.join(' ') 
                                : currentSegment.question.correctAnswer}
                        </p>
                    )}
                    <div className="mt-2 text-sm font-bold text-duo-text-sub">
                        {currentSegment.question?.explanation}
                    </div>
                    </div>
                </div>
                <Button onClick={handleNext} variant={status === 'CORRECT' ? 'primary' : 'danger'} fullWidth size="lg">
                    CONTINUE
                </Button>
                </div>
            )}
            </div>

            {/* Tutor Overlay */}
            {tutorMessage && (status === 'IDLE' || status === 'TRY_AGAIN') && (
            <div className="absolute bottom-32 left-4 right-4 bg-duo-blue-accent text-white p-6 rounded-3xl shadow-2xl border-b-8 border-duo-blue-dark animate-in slide-in-from-bottom-10 z-50">
                <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-4">
                        <div className="text-5xl -mt-2">🤖</div>
                        <div>
                            <h4 className="font-bold text-white/70 text-xs uppercase mb-1">Byte_Bot Hint</h4>
                            <p className="font-bold text-lg leading-snug">{tutorMessage}</p>
                        </div>
                    </div>
                    <button onClick={() => setTutorMessage(null)} className="text-white/50 hover:text-white p-1 hover:bg-black/10 rounded-lg">
                        <X size={24} />
                    </button>
                </div>
                <div className="absolute -bottom-4 left-10 w-8 h-8 bg-duo-blue-accent border-r-8 border-b-8 border-duo-blue-dark transform rotate-45"></div>
            </div>
            )}
        </div>
      )}
    </div>
  );
};
