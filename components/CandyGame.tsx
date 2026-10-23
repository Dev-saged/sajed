import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Candy, CheckCircle, XCircle, ArrowRight, Trophy, Shield, Volume2, ArrowUp } from 'lucide-react';

interface Props {
  language: 'English' | 'Arabic';
}

const QUESTIONS = [
  {
    id: 1,
    q: { ar: "ما نوع حدود الصفائح التي تُكوّن البراكين المخروطية؟", en: "Which plate boundary forms composite volcanoes?" },
    a: [
      { t: { ar: "تقاربية", en: "Convergent" }, c: true },
      { t: { ar: "تباعدية", en: "Divergent" }, c: false },
      { t: { ar: "انزلاقية", en: "Transform" }, c: false },
      { t: { ar: "ساكنة", en: "Stable" }, c: false }
    ]
  },
  {
    id: 2,
    q: { ar: "ما الرمز الكيميائي للكالسيوم؟", en: "What is the chemical symbol for Calcium?" },
    a: [
      { t: { ar: "Ca", en: "Ca" }, c: true },
      { t: { ar: "Mg", en: "Mg" }, c: false },
      { t: { ar: "Na", en: "Na" }, c: false },
      { t: { ar: "Cl", en: "Cl" }, c: false }
    ]
  },
  {
    id: 3,
    q: { ar: "أي كوكب يُعرف بالكوكب الأحمر؟", en: "Which planet is known as the Red Planet?" },
    a: [
      { t: { ar: "المريخ", en: "Mars" }, c: true },
      { t: { ar: "الأرض", en: "Earth" }, c: false },
      { t: { ar: "زحل", en: "Saturn" }, c: false },
      { t: { ar: "عطارد", en: "Mercury" }, c: false }
    ]
  },
  {
    id: 4,
    q: { ar: "ما هو العنصر الذي تتكون منه حشوة قلم الرصاص؟", en: "What element is pencil lead made of?" },
    a: [
      { t: { ar: "الكربون (الجرافيت)", en: "Carbon (Graphite)" }, c: true },
      { t: { ar: "الرصاص", en: "Lead" }, c: false },
      { t: { ar: "الحديد", en: "Iron" }, c: false },
      { t: { ar: "الذهب", en: "Gold" }, c: false }
    ]
  },
  {
    id: 5,
    q: { ar: "أي جزء من الزهرة يتحول إلى ثمرة؟", en: "Which part of the flower becomes the fruit?" },
    a: [
      { t: { ar: "المبيض", en: "Ovary" }, c: true },
      { t: { ar: "البتلات", en: "Petals" }, c: false },
      { t: { ar: "السداة", en: "Stamen" }, c: false },
      { t: { ar: "الجذر", en: "Root" }, c: false }
    ]
  },
  {
    id: 6,
    q: { ar: "ما هو الغاز الذي نتنفسه للحياة؟", en: "What gas do we breathe to live?" },
    a: [
      { t: { ar: "الأكسجين", en: "Oxygen" }, c: true },
      { t: { ar: "الهيدروجين", en: "Hydrogen" }, c: false },
      { t: { ar: "الهيليوم", en: "Helium" }, c: false },
      { t: { ar: "النيتروجين", en: "Nitrogen" }, c: false }
    ]
  },
  {
    id: 7,
    q: { ar: "ما هو أكبر حيوان في العالم؟", en: "What is the largest animal in the world?" },
    a: [
      { t: { ar: "الحوت الأزرق", en: "Blue Whale" }, c: true },
      { t: { ar: "الفيل", en: "Elephant" }, c: false },
      { t: { ar: "الزرافة", en: "Giraffe" }, c: false },
      { t: { ar: "القرش", en: "Shark" }, c: false }
    ]
  },
  {
    id: 8,
    q: { ar: "كم عدد ألوان قوس قزح؟", en: "How many colors are in a rainbow?" },
    a: [
      { t: { ar: "7", en: "7" }, c: true },
      { t: { ar: "5", en: "5" }, c: false },
      { t: { ar: "6", en: "6" }, c: false },
      { t: { ar: "8", en: "8" }, c: false }
    ]
  }
];

const MAX_LEVEL = 25;
const LEVELS = Array.from({length: MAX_LEVEL}, (_, i) => i + 1);
const SAFE_LEVELS = [5, 10, 18];

const MESSAGES = {
  win: [
    "رائع! كمل كده 👏",
    "شطووور! 🍬",
    "أنت بطل بونبون 😍",
    "قربت توصل للقمة 👑",
    "عظيم! إجابة مذهلة 🌟"
  ],
  lose: [
    "ولا يهمك 💙 جرب تاني",
    "أهم حاجة إنك بتتعلم ✨",
    "المرة الجاية هتنجح 💪",
    "لا تيأس، حاول مرة أخرى! 🚀"
  ]
};

export const CandyGame: React.FC<Props> = ({ language }) => {
  const [currentLevel, setCurrentLevel] = useState(0); // 0 means haven't started or at base
  const [safeLevel, setSafeLevel] = useState(0);
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'feedback'>('start');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<any[]>([]);
  
  // Mascot State
  const [mascot, setMascot] = useState<{type: 'win'|'lose', text: string} | null>(null);
  const mascotTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Audio
  const candySound = useRef<HTMLAudioElement | null>(null);

  // Ref for Game Container to auto-scroll on mobile
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    candySound.current = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-game-success-alert-2039.mp3");
  }, []);

  // Auto-scroll when game state changes (Mobile UX)
  useEffect(() => {
    if (window.innerWidth < 768 && (gameState === 'playing' || gameState === 'feedback')) {
        setTimeout(() => {
            gameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
    }
  }, [gameState, currentQIndex]);

  const showMascot = (type: 'win' | 'lose') => {
    if (mascotTimeoutRef.current) clearTimeout(mascotTimeoutRef.current);
    
    const msgs = MESSAGES[type];
    const text = msgs[Math.floor(Math.random() * msgs.length)];
    
    setMascot({ type, text });
    
    mascotTimeoutRef.current = setTimeout(() => {
        setMascot(null);
    }, 4000);
  };

  const playWinSound = () => {
    if (candySound.current) {
        candySound.current.currentTime = 0;
        candySound.current.play().catch(e => console.log("Audio play blocked", e));
    }
  };

  const isAr = language === 'Arabic';
  const t = {
    title: isAr ? "🍬 من سيربح البونبون" : "🍬 Who Will Win the Candy",
    desc: isAr ? "أجب عن الأسئلة واصعد سلم البونبون!" : "Answer questions and climb the Candy Ladder!",
    start: isAr ? "ابدأ اللعبة" : "Start Game",
    next: isAr ? "سؤال جديد" : "Next Question",
    retry: isAr ? "استمر" : "Continue",
    correct: isAr ? "إجابة صحيحة! 🎉" : "Correct Answer! 🎉",
    wrong: isAr ? "إجابة خاطئة 😢" : "Wrong Answer 😢",
    fallback: (lvl: number) => isAr ? `عودة إلى المستوى الآمن: ${lvl}` : `Falling back to safe level: ${lvl}`,
    promote: (lvl: number) => isAr ? `صعدت للمستوى: ${lvl}` : `Promoted to Level: ${lvl}`,
    ladder: isAr ? "سلم البونبون" : "Candy Ladder",
    scrollTop: isAr ? "للأعلى" : "Top"
  };

  const loadQuestion = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * QUESTIONS.length);
    setCurrentQIndex(randomIndex);
    
    const q = QUESTIONS[randomIndex];
    const answers = [...q.a].sort(() => Math.random() - 0.5);
    setShuffledAnswers(answers);
    
    setGameState('playing');
    setFeedback(null);
  }, []);

  const handleAnswer = (isCorrect: boolean) => {
    if (gameState !== 'playing') return;

    if (isCorrect) {
        const next = currentLevel + 1;
        if (next <= MAX_LEVEL) {
            setCurrentLevel(next);
            if (SAFE_LEVELS.includes(next)) {
                setSafeLevel(next);
            }
        }
        playWinSound();
        showMascot('win');
        setFeedback('correct');
        setGameState('feedback');
    } else {
        setCurrentLevel(safeLevel);
        showMascot('lose');
        setFeedback('wrong');
        setGameState('feedback');
    }
  };

  const scrollToTop = () => {
      gameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={gameRef} className="w-full flex flex-col md:flex-row gap-6 max-w-5xl mx-auto items-start relative md:h-[600px] overflow-visible md:overflow-hidden">
      
      {/* Styles for Mascot and Shield Animation */}
      <style>{`
        @keyframes pop {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .mascot-pop {
          animation: pop 0.4s ease forwards;
        }

        /* 🛡️ Safe Shield Neon Effect */
        .safe-shield {
          border: 2px solid #facc15 !important;
          background: linear-gradient(135deg, #facc15, #f59e0b) !important;
          color: #000 !important;
          box-shadow: 0 0 6px #facc15, 0 0 12px #facc15, 0 0 20px rgba(250,204,21,.8);
          border-radius: 10px;
          animation: neonPulse 2s infinite ease-in-out;
          z-index: 10;
        }

        @keyframes neonPulse {
          0% { box-shadow: 0 0 4px #facc15, 0 0 10px rgba(250,204,21,.6); }
          50% { box-shadow: 0 0 10px #fde047, 0 0 22px rgba(253,224,71,.9); }
          100% { box-shadow: 0 0 4px #facc15, 0 0 10px rgba(250,204,21,.6); }
        }
      `}</style>

      {/* Mascot Notification */}
      {mascot && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-slate-700 max-w-xs mascot-pop flex items-center gap-3 rtl:left-6 rtl:right-auto">
            <span className="text-3xl">{mascot.type === 'win' ? '🐻🍬' : '🐻💙'}</span>
            <div className="font-bold text-sm leading-tight">
                {mascot.text}
            </div>
        </div>
      )}

      {/* Candy Ladder (Scrollable) */}
      <div className="w-full md:w-48 bg-slate-900 rounded-2xl p-2 border border-slate-700 shadow-xl shrink-0 flex flex-col max-h-[220px] md:max-h-full md:h-full overflow-hidden transition-all order-2 md:order-1">
          <h4 className="text-yellow-400 font-bold text-center mb-2 flex items-center justify-center gap-2 py-2 border-b border-slate-800 shrink-0">
             <Candy className="w-4 h-4" /> {t.ladder}
          </h4>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 pr-1 space-y-1">
             <div className="flex flex-col-reverse gap-1">
             {LEVELS.map((lvl) => {
                 const isCurrent = lvl === currentLevel;
                 const isPassed = lvl < currentLevel;
                 const isSafe = SAFE_LEVELS.includes(lvl);
                 
                 let baseClasses = "relative text-center py-1.5 px-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-between ";
                 
                 if (isSafe) {
                     baseClasses += "safe-shield scale-105 my-1 ";
                 } else if (isCurrent) {
                     baseClasses += "bg-yellow-500 text-black scale-105 shadow-lg z-10 ";
                 } else if (isPassed) {
                     baseClasses += "bg-green-900/40 text-green-400 opacity-60 ";
                 } else {
                     baseClasses += "bg-slate-800 text-slate-500 opacity-50 ";
                 }

                 return (
                     <div 
                        key={lvl}
                        className={baseClasses}
                        id={isCurrent ? "current-level" : undefined}
                     >
                        <span className="w-4 flex justify-center">
                            {isSafe && <Shield className="w-3 h-3 text-black" />}
                        </span>
                        <span>🍬 {lvl}</span>
                        <span className="w-4 flex justify-center">
                            {isCurrent && <ArrowRight className={`w-3 h-3 ${isAr ? 'rotate-180' : ''}`} />}
                        </span>
                     </div>
                 )
             })}
             </div>
          </div>
      </div>

      <div className="flex-1 w-full md:h-full flex flex-col order-1 md:order-2">
        <div className="mb-2 text-center md:text-left rtl:md:text-right">
            <h3 className="text-2xl font-bold text-pink-400 flex items-center gap-2">
                <Candy className="w-6 h-6" />
                {t.title}
            </h3>
            <p className="text-slate-400 text-sm">{t.desc}</p>
        </div>

        <div className="flex-1 bg-slate-800 p-6 rounded-3xl border-4 border-pink-400/30 shadow-2xl relative overflow-visible flex flex-col justify-center min-h-[400px]">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none rounded-2xl" 
                style={{ backgroundImage: 'radial-gradient(circle, #f472b6 2px, transparent 2px)', backgroundSize: '24px 24px' }}>
            </div>

            {/* Current Level Mobile Badge */}
            <div className="md:hidden absolute top-4 right-4 bg-slate-900/90 px-3 py-1 rounded-full border border-yellow-500/50 flex items-center gap-2 rtl:right-auto rtl:left-4 z-20">
                <Trophy className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-sm">{currentLevel}</span>
            </div>

            {/* START STATE */}
            {gameState === 'start' && (
                <div className="text-center animate-fade-in relative z-10">
                    <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Candy className="w-10 h-10 text-pink-500 animate-bounce" />
                    </div>
                    <button 
                        onClick={loadQuestion}
                        className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-lg font-bold rounded-xl shadow-lg transition-transform hover:scale-105"
                    >
                        {t.start}
                    </button>
                </div>
            )}

            {/* PLAYING STATE */}
            {gameState === 'playing' && (
                <div className="animate-fade-in relative z-10 w-full text-center">
                    <div className="mb-6">
                         <span className="inline-block bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-xs font-bold mb-3">
                             {isAr ? `السؤال رقم ${currentQIndex + 1}` : `Question ${currentQIndex + 1}`}
                         </span>
                        <p className="text-xl md:text-2xl font-bold text-white leading-relaxed max-w-xl mx-auto">
                            {isAr ? QUESTIONS[currentQIndex].q.ar : QUESTIONS[currentQIndex].q.en}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                        {shuffledAnswers.map((ans, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(ans.c)}
                                className="w-full p-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all border-2 border-transparent hover:border-pink-400 text-base shadow-md active:scale-[0.98]"
                            >
                                {isAr ? ans.t.ar : ans.t.en}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* FEEDBACK STATE */}
            {gameState === 'feedback' && (
                <div className="animate-fade-in relative z-10 flex flex-col items-center text-center">
                    {feedback === 'correct' ? (
                        <>
                            <CheckCircle className="w-20 h-20 text-green-400 mb-4 animate-[pop_0.5s_ease]" />
                            <h2 className="text-2xl font-bold text-green-400 mb-2">{t.correct}</h2>
                            <p className="text-slate-300 mb-6">{t.promote(currentLevel)}</p>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-20 h-20 text-red-400 mb-4 animate-[pop_0.5s_ease]" />
                            <h2 className="text-2xl font-bold text-red-400 mb-2">{t.wrong}</h2>
                            <p className="text-slate-300 mb-6">{t.fallback(safeLevel)}</p>
                        </>
                    )}
                    
                    <button 
                        onClick={loadQuestion}
                        className="px-8 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
                    >
                        {feedback === 'correct' ? t.next : t.retry} 
                        {isAr ? <ArrowRight className="w-4 h-4 rotate-180" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                </div>
            )}
        </div>
      </div>
      
      {/* Floating Scroll to Top for Mobile */}
      <button 
        onClick={scrollToTop}
        className="md:hidden fixed bottom-4 right-4 z-50 bg-yellow-400 text-black p-3 rounded-full shadow-lg border-2 border-yellow-200 opacity-80 hover:opacity-100"
        title={t.scrollTop}
      >
        <ArrowUp className="w-6 h-6" />
      </button>

    </div>
  );
};
