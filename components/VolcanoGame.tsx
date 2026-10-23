import React, { useState } from 'react';

interface Props {
  language: 'English' | 'Arabic';
}

export const VolcanoGame: React.FC<Props> = ({ language }) => {
  const [selectedVolcano, setSelectedVolcano] = useState<string | null>(null);
  const [result, setResult] = useState<{ text: string; isCorrect: boolean } | null>(null);

  const isAr = language === 'Arabic';
  const langKey = isAr ? 'ar' : 'en';

  const TXT = {
    ar: {
      title: "🌋 مطابقة أنواع البراكين",
      desc: "اربط بين نوع البركان ومكان التشكُّل المناسب",
      colTypes: "أنواع البراكين",
      colLocs: "أماكن التشكُّل",
      shield: "بركان درعي",
      composite: "بركان مركب",
      cinder: "بركان مخروطي",
      hotspot: "فوق البقع الساخنة",
      plates: "عند حدود الصفائح",
      cracks: "شقوق في القشرة الأرضية",
      correct: "✔️ إجابة صحيحة",
      wrong: "❌ حاول مرة أخرى"
    },
    en: {
      title: "🌋 Volcano Types Matching",
      desc: "Match each volcano type with its formation location",
      colTypes: "Volcano Types",
      colLocs: "Formation Locations",
      shield: "Shield Volcano",
      composite: "Composite Volcano",
      cinder: "Cinder Cone",
      hotspot: "Hot Spots",
      plates: "Plate Boundaries",
      cracks: "Crustal Cracks",
      correct: "✔️ Correct Answer",
      wrong: "❌ Try Again"
    }
  };

  const t = TXT[langKey];

  const types = [
    { id: 'shield', label: t.shield },
    { id: 'composite', label: t.composite },
    { id: 'cinder', label: t.cinder },
  ];

  const locations = [
    { id: 'hotspot', label: t.hotspot },
    { id: 'plates', label: t.plates },
    { id: 'cracks', label: t.cracks },
  ];

  const correctMap: Record<string, string> = {
    shield: 'hotspot',
    composite: 'plates',
    cinder: 'cracks'
  };

  const handleLocClick = (locId: string) => {
    if (!selectedVolcano) return;

    const isCorrect = correctMap[selectedVolcano] === locId;
    
    setResult({
      text: isCorrect ? t.correct : t.wrong,
      isCorrect
    });

    if (isCorrect) {
      setSelectedVolcano(null);
    }
  };

  return (
    <div className="w-full text-left rtl:text-right space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2 text-orange-500">{t.title}</h3>
        <p className="text-slate-400">{t.desc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Volcano Types Column */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
          <h4 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">{t.colTypes}</h4>
          <div className="space-y-3">
            {types.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedVolcano(item.id);
                  setResult(null);
                }}
                className={`w-full p-4 rounded-xl font-bold text-left rtl:text-right transition-all transform duration-200 border-2 ${
                  selectedVolcano === item.id
                    ? 'bg-orange-600 text-white border-orange-500 scale-105 shadow-lg shadow-orange-500/20'
                    : 'bg-slate-700 text-slate-300 border-transparent hover:bg-slate-600 hover:border-slate-500'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Locations Column */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
          <h4 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">{t.colLocs}</h4>
          <div className="space-y-3">
            {locations.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLocClick(item.id)}
                disabled={!selectedVolcano}
                className={`w-full p-4 rounded-xl font-bold text-left rtl:text-right transition-all border-2 ${
                  !selectedVolcano 
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
