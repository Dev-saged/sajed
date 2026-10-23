import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ArrowDown, ArrowUp } from 'lucide-react';

interface Props {
  language: 'English' | 'Arabic';
}

export const TransformerGame: React.FC<Props> = ({ language }) => {
  const [primaryTurns, setPrimaryTurns] = useState(0);
  const [secondaryTurns, setSecondaryTurns] = useState(0);
  const [result, setResult] = useState<{ text: string; isCorrect: boolean } | null>(null);

  const isAr = language === 'Arabic';
  const t = {
    title: isAr ? "⚡ تحدي المحولات الكهربائية" : "⚡ Transformer Challenge",
    desc: isAr ? "حدد نوع المحول بناءً على عدد اللفات" : "Determine transformer type based on coil turns",
    primary: isAr ? "عدد لفات الملف الابتدائي" : "Primary Coil Turns",
    secondary: isAr ? "عدد لفات الملف الثانوي" : "Secondary Coil Turns",
    stepUp: isAr ? "محول رافع" : "Step-up Transformer",
    stepDown: isAr ? "محول خافض" : "Step-down Transformer",
    correct: isAr ? "✔️ إجابة صحيحة" : "✔️ Correct Answer",
    wrong: isAr ? "❌ حاول مرة أخرى" : "❌ Try Again",
    next: isAr ? "سؤال جديد" : "New Question",
    turns: "Turns",
    input: isAr ? "دخل" : "Input",
    output: isAr ? "خرج" : "Output"
  };

  const generateQuestion = useCallback(() => {
    const p = Math.floor(Math.random() * 40) + 20;
    let s = Math.floor(Math.random() * 40) + 20;
    // Ensure they are not equal
    while (s === p) {
       s = Math.floor(Math.random() * 40) + 20;
    }
    setPrimaryTurns(p);
    setSecondaryTurns(s);
    setResult(null);
  }, []);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const checkAnswer = (type: 'up' | 'down') => {
    const isStepUp = secondaryTurns > primaryTurns;
    const correctType = isStepUp ? 'up' : 'down';

    if (type === correctType) {
        setResult({ text: t.correct, isCorrect: true });
    } else {
        setResult({ text: t.wrong, isCorrect: false });
    }
  };

  return (
    <div className="w-full text-center space-y-8 max-w-2xl mx-auto">
        <div className="mb-4">
            <h3 className="text-2xl font-bold mb-2 text-yellow-400">{t.title}</h3>
            <p className="text-slate-400">{t.desc}</p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-6 items-center">
            {/* Primary Coil */}
            <div className="flex-1 w-full bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 shadow-xl relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
                <div className="absolute top-0 left-0 bg-yellow-500/20 text-yellow-500 text-xs font-bold px-2 py-1 rounded-br-lg rtl:left-auto rtl:right-0 rtl:rounded-bl-lg rtl:rounded-br-none">{t.input}</div>
                <div className="text-slate-400 font-bold mb-2 text-sm uppercase tracking-wider">{t.primary}</div>
                <div className="text-5xl font-mono font-bold text-sky-400 mb-2">{primaryTurns}</div>
                <div className="text-xs text-slate-500 font-bold">{t.turns} (Np)</div>
                {/* Visual Coil Representation */}
                <div className="mt-4 flex justify-center gap-1 opacity-50">
                    {[...Array(Math.min(10, Math.floor(primaryTurns/5)))].map((_, i) => (
                        <div key={i} className="w-1.5 h-8 bg-sky-500/50 rounded-full"></div>
                    ))}
                </div>
            </div>
            
            {/* Arrow Indicator */}
            <div className="text-slate-600 flex flex-col items-center justify-center">
                {isAr ? (
                    <ArrowRight className="w-8 h-8 rotate-180 md:rotate-0 text-slate-500" /> 
                ) : (
                    <ArrowRight className="w-8 h-8 rotate-90 md:rotate-0 text-slate-500" />
                )}
            </div>

            {/* Secondary Coil */}
            <div className="flex-1 w-full bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 shadow-xl relative overflow-hidden group hover:border-pink-500/50 transition-colors">
                <div className="absolute top-0 right-0 bg-pink-500/20 text-pink-500 text-xs font-bold px-2 py-1 rounded-bl-lg rtl:right-auto rtl:left-0 rtl:rounded-br-lg rtl:rounded-bl-none">{t.output}</div>
                <div className="text-slate-400 font-bold mb-2 text-sm uppercase tracking-wider">{t.secondary}</div>
                <div className="text-5xl font-mono font-bold text-pink-400 mb-2">{secondaryTurns}</div>
                <div className="text-xs text-slate-500 font-bold">{t.turns} (Ns)</div>
                {/* Visual Coil Representation */}
                <div className="mt-4 flex justify-center gap-1 opacity-50">
                    {[...Array(Math.min(10, Math.floor(secondaryTurns/5)))].map((_, i) => (
                        <div key={i} className="w-1.5 h-8 bg-pink-500/50 rounded-full"></div>
                    ))}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <button 
                onClick={() => checkAnswer('up')}
                className="flex flex-col items-center justify-center p-4 bg-slate-700 hover:bg-slate-600 hover:border-green-500 border-2 border-transparent rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 group"
            >
                <ArrowUp className="w-6 h-6 mb-2 text-green-400 group-hover:-translate-y-1 transition-transform" />
                {t.stepUp}
            </button>
            <button 
                onClick={() => checkAnswer('down')}
                className="flex flex-col items-center justify-center p-4 bg-slate-700 hover:bg-slate-600 hover:border-red-500 border-2 border-transparent rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 group"
            >
                <ArrowDown className="w-6 h-6 mb-2 text-red-400 group-hover:translate-y-1 transition-transform" />
                {t.stepDown}
            </button>
        </div>

        {result && (
            <div className={`mt-6 p-4 rounded-xl font-bold text-lg animate-bounce border-2 shadow-lg ${
            result.isCorrect 
                ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                : 'bg-red-500/20 text-red-400 border-red-500/50'
            }`}>
            {result.text}
            </div>
        )}

        {result?.isCorrect && (
            <button 
                onClick={generateQuestion}
                className="px-8 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105"
            >
                {t.next}
            </button>
        )}
    </div>
  );
};
