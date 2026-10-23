import React, { useState } from 'react';

interface Props {
  language: 'English' | 'Arabic';
}

export const MagnetGame: React.FC<Props> = ({ language }) => {
  const [materialResult, setMaterialResult] = useState<{ text: string; isCorrect: boolean } | null>(null);

  const isAr = language === 'Arabic';
  const langKey = isAr ? 'ar' : 'en';

  const TXT = {
    ar: {
      title: "🧲 خواص المغناطيس",
      stage1: "1️⃣ التجاذب والتنافر",
      stage2: "2️⃣ المواد المغناطيسية",
      stage3: "3️⃣ اتجاه المجال المغناطيسي",
      attract: "تجاذب (N مع S)",
      repel: "تنافر",
      choose: "اختر المادة التي تنجذب للمغناطيس:",
      correct: "✔️ صحيح",
      wrong: "❌ خطأ",
      iron: "حديد",
      wood: "خشب",
      plastic: "بلاستيك",
      copper: "نحاس",
      explainIron: "الحديد مادة مغناطيسية تنجذب للمغناطيس.",
      explainOther: "هذه المادة غير مغناطيسية، لا تنجذب."
    },
    en: {
      title: "🧲 Magnet Properties",
      stage1: "1️⃣ Attraction & Repulsion",
      stage2: "2️⃣ Magnetic Materials",
      stage3: "3️⃣ Magnetic Field Direction",
      attract: "Attraction (N with S)",
      repel: "Repulsion",
      choose: "Choose the material attracted to magnets:",
      correct: "✔️ Correct",
      wrong: "❌ Wrong",
      iron: "Iron",
      wood: "Wood",
      plastic: "Plastic",
      copper: "Copper",
      explainIron: "Iron is a magnetic material.",
      explainOther: "This material is not magnetic."
    }
  };

  const t = TXT[langKey];

  const checkMat = (type: string) => {
    if (type === 'iron') {
      setMaterialResult({ text: `${t.correct} – ${t.explainIron}`, isCorrect: true });
    } else {
      setMaterialResult({ text: `${t.wrong} – ${t.explainOther}`, isCorrect: false });
    }
  };

  return (
    <div className="w-full text-left rtl:text-right space-y-8">
      <h3 className="text-2xl font-bold mb-4 text-center text-sky-400">{t.title}</h3>

      {/* Stage 1: Attraction */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
        <h4 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-2">{t.stage1}</h4>
        
        <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center items-center gap-1 animate-pulse">
                <div className="bg-red-500 text-white font-black px-6 py-4 rounded-l-lg border-y-2 border-l-2 border-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]">N</div>
                <div className="bg-blue-500 text-white font-black px-6 py-4 rounded-r-lg border-y-2 border-r-2 border-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]">S</div>
            </div>
            <p className="text-center text-green-400 font-bold text-lg bg-green-500/10 px-4 py-2 rounded-full border border-green-500/30">
                {t.attract}
            </p>
        </div>
      </div>

      {/* Stage 2: Materials */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
        <h4 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">{t.stage2}</h4>
        <p className="mb-6 text-slate-300 font-medium">{t.choose}</p>
        
        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => checkMat('iron')} className="bg-slate-700 hover:bg-slate-600 p-4 rounded-xl font-bold text-white transition-all hover:scale-105 border-2 border-transparent hover:border-slate-500 shadow-lg">{t.iron}</button>
            <button onClick={() => checkMat('wood')} className="bg-amber-900/40 hover:bg-amber-800/60 p-4 rounded-xl font-bold text-amber-100 transition-all hover:scale-105 border-2 border-transparent hover:border-amber-700 shadow-lg">{t.wood}</button>
            <button onClick={() => checkMat('plastic')} className="bg-blue-900/40 hover:bg-blue-800/60 p-4 rounded-xl font-bold text-blue-100 transition-all hover:scale-105 border-2 border-transparent hover:border-blue-700 shadow-lg">{t.plastic}</button>
            <button onClick={() => checkMat('copper')} className="bg-orange-900/40 hover:bg-orange-800/60 p-4 rounded-xl font-bold text-orange-100 transition-all hover:scale-105 border-2 border-transparent hover:border-orange-700 shadow-lg">{t.copper}</button>
        </div>
        
        {materialResult && (
            <div className={`mt-6 p-4 rounded-xl font-bold text-center text-lg animate-bounce border-2 ${materialResult.isCorrect ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
                {materialResult.text}
            </div>
        )}
      </div>

      {/* Stage 3: Field */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
        <h4 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">{t.stage3}</h4>
        <div className="relative border-2 border-dashed border-sky-500/30 bg-slate-900/50 p-8 rounded-xl text-center overflow-hidden">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent"></div>
            
            <div className="relative z-10 flex items-center justify-center gap-4 text-2xl md:text-4xl font-mono text-sky-300 tracking-widest font-bold">
                <span className="text-red-500">N</span>
                <span className="animate-pulse">➜ ➜ ➜</span>
                <span className="text-blue-500">S</span>
            </div>
            <p className="mt-4 text-sm text-slate-400">
               {isAr ? "خطوط المجال تخرج من القطب الشمالي وتدخل للقطب الجنوبي" : "Field lines exit North and enter South"}
            </p>
        </div>
      </div>
    </div>
  );
};
