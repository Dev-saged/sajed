import React, { useState } from 'react';

interface Props {
  language: 'English' | 'Arabic';
}

export const FaultGame: React.FC<Props> = ({ language }) => {
  const [selectedFault, setSelectedFault] = useState<string | null>(null);
  const [result, setResult] = useState<{ text: string; isCorrect: boolean } | null>(null);

  const isAr = language === 'Arabic';
  const langKey = isAr ? 'ar' : 'en';

  const TXT = {
    ar: {
      title: "📐 مطابقة أنواع الصدوع",
      desc: "اربط بين نوع الصدع والقوة المسببة له",
      colFaults: "أنواع الصدوع",
      colForces: "القوى المسببة",
      normal: "الصدع العادي",
      reverse: "الصدع المعكوس",
      strike: "الصدع الانزلاقي",
      tension: "قوى شد",
      compression: "قوى ضغط",
      shear: "قوى قص",
      correct: "✔️ إجابة صحيحة",
      wrong: "❌ حاول مرة أخرى"
    },
    en: {
      title: "📐 Fault Types Matching",
      desc: "Match each fault type with its force",
      colFaults: "Fault Types",
      colForces: "Forces",
      normal: "Normal Fault",
      reverse: "Reverse Fault",
      strike: "Strike-slip Fault",
      tension: "Tension Force",
      compression: "Compression Force",
      shear: "Shear Force",
      correct: "✔️ Correct Answer",
      wrong: "❌ Try Again"
    }
  };

  const t = TXT[langKey];

  const faults = [
    { id: 'normal', label: t.normal },
    { id: 'reverse', label: t.reverse },
    { id: 'strike', label: t.strike },
  ];

  const forces = [
    { id: 'tension', label: t.tension },
    { id: 'compression', label: t.compression },
    { id: 'shear', label: t.shear },
  ];

  const correctMap: Record<string, string> = {
    normal: 'tension',
    reverse: 'compression',
    strike: 'shear'
  };

  const handleForceClick = (forceId: string) => {
    if (!selectedFault) return;

    const isCorrect = correctMap[selectedFault] === forceId;
    
    setResult({
      text: isCorrect ? t.correct : t.wrong,
      isCorrect
    });

    if (isCorrect) {
      // Optional: clear selection on success to let user pick next
      setSelectedFault(null);
    }
  };

  return (
    <div className="w-full text-left rtl:text-right space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2 text-sky-400">{t.title}</h3>
        <p className="text-slate-400">{t.desc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Faults Column */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
          <h4 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">{t.colFaults}</h4>
          <div className="space-y-3">
            {faults.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedFault(item.id);
                  setResult(null);
                }}
                className={`w-full p-4 rounded-xl font-bold text-left rtl:text-right transition-all transform duration-200 border-2 ${
                  selectedFault === item.id
                    ? 'bg-sky-500 text-white border-sky-400 scale-105 shadow-lg shadow-sky-500/20'
                    : 'bg-slate-700 text-slate-300 border-transparent hover:bg-slate-600 hover:border-slate-500'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Forces Column */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
          <h4 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">{t.colForces}</h4>
          <div className="space-y-3">
            {forces.map((item) => (
              <button
                key={item.id}
                onClick={() => handleForceClick(item.id)}
                disabled={!selectedFault}
                className={`w-full p-4 rounded-xl font-bold text-left rtl:text-right transition-all border-2 ${
                  !selectedFault 
                    ? 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed'
                    : 'bg-slate-700 text-slate-300 border-transparent hover:bg-slate-600 hover:border-slate-500 cursor-pointer'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className={`mt-6 p-4 rounded-xl font-bold text-center text-lg animate-bounce border-2 max-w-md mx-auto shadow-lg ${
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
