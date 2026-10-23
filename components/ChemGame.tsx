import React, { useState, useEffect, useCallback } from 'react';

interface Props {
  language: 'English' | 'Arabic';
}

const ELEMENTS = [
  { ar: "الهيدروجين", en: "Hydrogen", symbol: "H" },
  { ar: "الأكسجين", en: "Oxygen", symbol: "O" },
  { ar: "الكربون", en: "Carbon", symbol: "C" },
  { ar: "الصوديوم", en: "Sodium", symbol: "Na" },
  { ar: "الكلور", en: "Chlorine", symbol: "Cl" },
  { ar: "الحديد", en: "Iron", symbol: "Fe" },
  { ar: "البوتاسيوم", en: "Potassium", symbol: "K" },
  { ar: "النيتروجين", en: "Nitrogen", symbol: "N" },
  { ar: "الكالسيوم", en: "Calcium", symbol: "Ca" },
  { ar: "الذهب", en: "Gold", symbol: "Au" }
];

export const ChemGame: React.FC<Props> = ({ language }) => {
  const [current, setCurrent] = useState<typeof ELEMENTS[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [result, setResult] = useState<{ text: string; isCorrect: boolean } | null>(null);

  const isAr = language === 'Arabic';
  const t = {
    title: isAr ? "🧪 تحدي الرمز الكيميائي" : "🧪 Chemical Symbol Challenge",
    desc: isAr ? "اختر الرمز الكيميائي الصحيح للعنصر" : "Choose the correct chemical symbol",
    correct: isAr ? "✔️ إجابة صحيحة" : "✔️ Correct Answer",
    wrong: isAr ? "❌ إجابة خاطئة" : "❌ Wrong Answer",
    questionPre: isAr ? "ما هو رمز عنصر" : "What is the symbol for",
  };

  const generateQuestion = useCallback(() => {
    setResult(null);
    const randomElement = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    setCurrent(randomElement);

    const distractors: string[] = [];
    while (distractors.length < 3) {
      const randomDist = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)].symbol;
      if (randomDist !== randomElement.symbol && !distractors.includes(randomDist)) {
        distractors.push(randomDist);
      }
    }

    const newOptions = [randomElement.symbol, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(newOptions);
  }, []);

  // Initial load
  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const handleCheck = (symbol: string) => {
    if (!current) return;
    
    if (symbol === current.symbol) {
      setResult({ text: t.correct, isCorrect: true });
      setTimeout(() => {
        generateQuestion();
      }, 1000);
    } else {
      setResult({ text: t.wrong, isCorrect: false });
    }
  };

  if (!current) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  return (
    <div className="w-full text-center space-y-8 max-w-lg mx-auto">
      <div className="mb-4">
        <h3 className="text-2xl font-bold mb-2 text-emerald-400">{t.title}</h3>
        <p className="text-slate-400">{t.desc}</p>
      </div>

      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

        <h4 className="text-lg text-slate-300 mb-2 font-medium">{t.questionPre}</h4>
        <div className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-wide drop-shadow-md">
           {isAr ? current.ar : current.en}
        </div>

        <div className="grid grid-cols-2 gap-4">
            {options.map((opt) => (
                <button
                    key={opt}
                    onClick={() => handleCheck(opt)}
                    className="bg-slate-700 hover:bg-slate-600 active:scale-95 text-white text-2xl font-bold py-4 rounded-xl transition-all border-b-4 border-slate-900 hover:border-slate-800 shadow-lg"
                >
                    {opt}
                </button>
            ))}
        </div>
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
    </div>
  );
};
