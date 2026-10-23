import React, { useState } from 'react';

interface GameProps {
  language: 'English' | 'Arabic';
}

export const GeneratorMotorGame: React.FC<GameProps> = ({ language }) => {
  const [genSelection, setGenSelection] = useState<string[]>([]);
  const [motorSelection, setMotorSelection] = useState<string[]>([]);
  const [result, setResult] = useState<'success' | 'error' | null>(null);

  const isAr = language === 'Arabic';

  // Generator Items (Based on user script)
  const genItems = [
    { id: 'coil', en: "Coil (Wire)", ar: "ملف (سلك)" },
    { id: 'magnet', en: "Magnet", ar: "مغناطيس" },
    { id: 'motion', en: "Motion Source", ar: "مصدر حركة" }, // Correct
    { id: 'battery', en: "Battery", ar: "بطارية" } // Wrong for generator (it produces, doesn't need battery)
  ];
  const genCorrect = ['coil', 'magnet', 'motion'];

  // Motor Items (Based on user script)
  const motorItems = [
    { id: 'coil', en: "Coil (Wire)", ar: "ملف (سلك)" },
    { id: 'magnet', en: "Magnet", ar: "مغناطيس" },
    { id: 'battery', en: "Electric Source (Battery)", ar: "مصدر كهرباء (بطارية)" }, // Correct
    { id: 'lamp', en: "Lamp", ar: "مصباح" } // Wrong (Motor creates motion, lamp is just another load)
  ];
  const motorCorrect = ['coil', 'magnet', 'battery'];

  const toggleSelection = (key: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(key)) {
      setList(list.filter(k => k !== key));
    } else {
      setList([...list, key]);
    }
    setResult(null);
  };

  const checkAnswer = () => {
    // Scoring Logic from script: +1 for correct, -1 for wrong selected
    let score = 0;

    // Generator Score
    genSelection.forEach(id => {
        if (genCorrect.includes(id)) score++;
        else score--;
    });

    // Motor Score
    motorSelection.forEach(id => {
        if (motorCorrect.includes(id)) score++;
        else score--;
    });

    // Max potential score = 3 (gen) + 3 (motor) = 6.
    // Script threshold was 5.
    // We can use strict logic or the score logic. Strict is clearer for UI feedback.
    // Let's use strict logic for "Success" state to ensure mastery.
    
    const genOk = genCorrect.every(i => genSelection.includes(i)) && !genSelection.some(i => !genCorrect.includes(i));
    const motorOk = motorCorrect.every(i => motorSelection.includes(i)) && !motorSelection.some(i => !motorCorrect.includes(i));

    if (genOk && motorOk) {
      setResult('success');
    } else {
      setResult('error');
    }
  };

  const t = {
    title: isAr ? "لعبة: المولد vs المحرك" : "Game: Generator vs Motor",
    desc: isAr ? "اختر الأجزاء الصحيحة لكل جهاز" : "Select the correct parts for each device",
    genTitle: isAr ? "المولد الكهربائي 🔋" : "Electric Generator 🔋",
    motorTitle: isAr ? "المحرك الكهربائي ⚡" : "Electric Motor ⚡",
    check: isAr ? "✔ تحقق" : "✔ Check",
    success: isAr ? "🎉 ممتاز! فهمك ممتاز للطاقة الكهربائية" : "🎉 Excellent! You understand electrical energy well.",
    error: isAr ? "❌ حاول مرة أخرى وفكّر في مصدر الطاقة" : "❌ Try again. Think about the energy source.",
  };

  return (
    <div className="w-full text-left rtl:text-right">
      <h3 className="text-xl font-bold mb-2 text-yellow-400 text-center">{t.title}</h3>
      <p className="text-slate-400 text-sm mb-6 text-center">{t.desc}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Generator Card */}
        <div className="border-2 border-slate-600 rounded-2xl p-5 bg-slate-800/80 shadow-lg hover:border-sky-500/50 transition-colors">
          <h4 className="font-bold text-sky-400 mb-4 text-lg border-b border-white/10 pb-2">{t.genTitle}</h4>
          <div className="space-y-3">
            {genItems.map((item) => (
              <label key={`gen-${item.id}`} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors select-none group">
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${genSelection.includes(item.id) ? 'bg-sky-500 border-sky-500' : 'border-slate-500 group-hover:border-sky-400'}`}>
                    {genSelection.includes(item.id) && <span className="text-white font-bold text-sm">✓</span>}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={genSelection.includes(item.id)}
                  onChange={() => toggleSelection(item.id, genSelection, setGenSelection)}
                />
                <span className="text-base font-bold text-slate-300 group-hover:text-white transition-colors">{isAr ? item.ar : item.en}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Motor Card */}
        <div className="border-2 border-slate-600 rounded-2xl p-5 bg-slate-800/80 shadow-lg hover:border-red-500/50 transition-colors">
          <h4 className="font-bold text-red-400 mb-4 text-lg border-b border-white/10 pb-2">{t.motorTitle}</h4>
          <div className="space-y-3">
            {motorItems.map((item) => (
              <label key={`motor-${item.id}`} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors select-none group">
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${motorSelection.includes(item.id) ? 'bg-red-500 border-red-500' : 'border-slate-500 group-hover:border-red-400'}`}>
                     {motorSelection.includes(item.id) && <span className="text-white font-bold text-sm">✓</span>}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={motorSelection.includes(item.id)}
                  onChange={() => toggleSelection(item.id, motorSelection, setMotorSelection)}
                />
                <span className="text-base font-bold text-slate-300 group-hover:text-white transition-colors">{isAr ? item.ar : item.en}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button 
          onClick={checkAnswer}
          className="w-full md:w-auto px-10 py-3 bg-gradient-to-r from-brand-500 to-sky-500 hover:from-brand-400 hover:to-sky-400 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-sky-500/20 active:scale-95 text-lg"
        >
          {t.check}
        </button>
        
        {result && (
          <div className={`text-lg font-bold px-6 py-3 rounded-xl animate-bounce shadow-lg border-2 ${result === 'success' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
            {result === 'success' ? t.success : t.error}
          </div>
        )}
      </div>
    </div>
  );
};
