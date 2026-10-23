import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  language: 'English' | 'Arabic';
}

const ELEMENTS = [
  { ar: "الهيدروجين", en: "Hydrogen", symbol: "H" },
  { ar: "الأكسجين", en: "Oxygen", symbol: "O" },
  { ar: "الكربون", en: "Carbon", symbol: "C" },
  { ar: "الحديد", en: "Iron", symbol: "Fe" },
  { ar: "الصوديوم", en: "Sodium", symbol: "Na" },
  { ar: "الكلور", en: "Chlorine", symbol: "Cl" },
  { ar: "البوتاسيوم", en: "Potassium", symbol: "K" },
  { ar: "النيتروجين", en: "Nitrogen", symbol: "N" },
];

interface FallingItem {
  id: number;
  symbol: string;
  x: number; // percentage
  top: number; // pixels
  speed: number;
}

export const CatchGame: React.FC<Props> = ({ language }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [target, setTarget] = useState<typeof ELEMENTS[0] | null>(null);
  const [items, setItems] = useState<FallingItem[]>([]);
  
  const requestRef = useRef<number | null>(null);
  const lastSpawnTime = useRef<number>(0);
  
  const isAr = language === 'Arabic';
  const t = {
    title: isAr ? "🎯 التقاط العناصر الكيميائية" : "🎯 Chemical Catch Game",
    desc: isAr ? "اضغط على الرمز الكيميائي الصحيح بسرعة!" : "Catch the correct chemical symbol quickly!",
    score: isAr ? "النقاط" : "Score",
    time: isAr ? "الوقت" : "Time",
    start: isAr ? "ابدأ اللعب" : "Start Game",
    targetPrefix: isAr ? "التقط عنصر:" : "Catch Element:",
    gameOver: isAr ? "انتهى الوقت!" : "Time's up!",
    finalScore: isAr ? "نقاطك النهائية:" : "Your Final Score:"
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setItems([]);
    
    // Pick random target
    const randomTarget = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    setTarget(randomTarget);
    
    setIsPlaying(true);
    lastSpawnTime.current = performance.now();
  };

  const spawnItem = () => {
    const randomEl = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    const newItem: FallingItem = {
      id: Math.random(),
      symbol: randomEl.symbol,
      x: Math.random() * 80 + 5, // 5% to 85%
      top: -50,
      speed: 2 + Math.random() * 2 // Speed between 2 and 4
    };
    setItems(prev => [...prev, newItem]);
  };

  // Game Loop
  const animate = useCallback((time: number) => {
    if (!isPlaying) return;

    // Spawn logic
    if (time - lastSpawnTime.current > 800) { // Spawn every 800ms
      spawnItem();
      lastSpawnTime.current = time;
    }

    // Move items
    setItems(prevItems => {
      const nextItems = prevItems
        .map(item => ({ ...item, top: item.top + item.speed }))
        .filter(item => item.top < 400); // Remove if out of bounds (assuming container height ~400px)
      return nextItems;
    });

    requestRef.current = requestAnimationFrame(animate);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, animate]);

  // Timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleItemClick = (id: number, symbol: string) => {
    if (!isPlaying || !target) return;
    
    if (symbol === target.symbol) {
      setScore(s => s + 10);
      // Play nice feedback sound or effect here if needed
    } else {
      setScore(s => Math.max(0, s - 5));
    }
    
    // Remove clicked item
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="w-full text-center space-y-6 max-w-2xl mx-auto select-none">
      <div className="mb-4">
        <h3 className="text-2xl font-bold mb-2 text-sky-400">{t.title}</h3>
        <p className="text-slate-400">{t.desc}</p>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
        
        {/* HUD */}
        <div className="flex justify-between items-center mb-6 text-xl font-bold font-mono">
            <div className="text-yellow-400 flex flex-col items-center">
                <span className="text-xs text-slate-400 uppercase">{t.score}</span>
                {score}
            </div>
            
            {target && isPlaying && (
                 <div className="bg-slate-900 px-6 py-2 rounded-xl border border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.3)] animate-pulse">
                     <span className="text-sm text-slate-400 block mb-1">{t.targetPrefix}</span>
                     <span className="text-2xl text-white block">{isAr ? target.ar : target.en} ({target.symbol})</span>
                 </div>
            )}

            <div className={`${timeLeft < 10 ? 'text-red-500' : 'text-green-400'} flex flex-col items-center`}>
                <span className="text-xs text-slate-400 uppercase">{t.time}</span>
                {timeLeft}s
            </div>
        </div>

        {/* Game Field */}
        <div 
            className="relative h-[400px] bg-slate-900 rounded-xl border-2 border-dashed border-slate-700 overflow-hidden cursor-crosshair touch-none"
        >
            {!isPlaying && timeLeft === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 backdrop-blur-sm animate-fade-in">
                    <h2 className="text-3xl font-bold text-white mb-2">{t.gameOver}</h2>
                    <p className="text-xl text-yellow-400 mb-6">{t.finalScore} {score}</p>
                    <button 
                        onClick={startGame}
                        className="px-8 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                        {t.start}
                    </button>
                </div>
            ) : !isPlaying && timeLeft === 30 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                    <button 
                        onClick={startGame}
                        className="px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white text-xl font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 animate-bounce"
                    >
                        {t.start}
                    </button>
                </div>
            ) : null}

            {items.map(item => (
                <div
                    key={item.id}
                    onMouseDown={(e) => { e.preventDefault(); handleItemClick(item.id, item.symbol); }}
                    onTouchStart={(e) => { e.preventDefault(); handleItemClick(item.id, item.symbol); }}
                    className="absolute w-12 h-12 flex items-center justify-center bg-slate-700 text-white font-bold rounded-full shadow-lg border-2 border-slate-600 hover:bg-slate-600 hover:border-white hover:scale-110 active:scale-90 transition-transform cursor-pointer select-none"
                    style={{ 
                        left: `${item.x}%`, 
                        top: `${item.top}px`,
                        zIndex: 10
                    }}
                >
                    {item.symbol}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};