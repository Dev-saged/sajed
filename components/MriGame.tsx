import React, { useState } from 'react';
import { Magnet, Radio, Activity, RotateCcw } from 'lucide-react';

interface Props {
  language: 'English' | 'Arabic';
}

export const MriGame: React.FC<Props> = ({ language }) => {
  const [step, setStep] = useState(0); // 0: init, 1: aligned, 2: pulsed, 3: read
  const isAr = language === 'Arabic';

  const t = {
    title: isAr ? "🧠 مغامرة الرنين المغناطيسي" : "🧠 MRI Adventure",
    desc: isAr ? "حاول ترتيب البروتونات وتشغيل النبضة لفهم فكرة الرنين المغناطيسي" : "Align protons and apply RF pulse to understand MRI concept",
    align: isAr ? "1️⃣ ترتيب البروتونات" : "1️⃣ Align Protons",
    pulse: isAr ? "2️⃣ تشغيل نبضة RF" : "2️⃣ Apply RF Pulse",
    read: isAr ? "3️⃣ قراءة الإشارة" : "3️⃣ Read Signal",
    alignedMsg: isAr ? "✔️ البروتونات اتجهت مع المجال المغناطيسي القوي!" : "✔️ Protons aligned with the strong magnetic field!",
    pulsedMsg: isAr ? "✔️ النبضة أثّرت على البروتونات وغيرت اتجاهها!" : "✔️ RF pulse affected protons and changed their orientation!",
    signalMsg: isAr ? "📡 تم استقبال الإشارة بنجاح وتكوين الصورة!" : "📡 Signal received successfully and image formed!",
    reset: isAr ? "إعادة المحاكاة" : "Reset Simulation",
    initSim: "🧲 ↑ ↓ ↘ ↖ ↗ ↓",
    alignedSim: "🧲 ↑ ↑ ↑ ↑ ↑ ↑",
    pulsedSim: "💫 ⟳ ⟳ ⟳ ⟳ ⟳",
    readSim: "📊 █ ▇ ▆ ▅ ▃"
  };

  const handleAlign = () => setStep(1);
  const handlePulse = () => { if (step >= 1) setStep(2); };
  const handleRead = () => { if (step >= 2) setStep(3); };
  const handleReset = () => setStep(0);

  return (
      <div className="w-full text-center space-y-8 max-w-3xl mx-auto">
        <div className="mb-4">
            <h3 className="text-2xl font-bold mb-2 text-pink-400">{t.title}</h3>
            <p className="text-slate-400">{t.desc}</p>
        </div>

        {/* Steps Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
             <button 
                onClick={handleAlign}
                disabled={step > 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${step >= 1 ? 'bg-green-600 text-white opacity-50 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600 text-white shadow-lg'}`}
             >
                <Magnet className="w-5 h-5" /> {t.align}
             </button>

             <button 
                onClick={handlePulse}
                disabled={step !== 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${step >= 2 ? 'bg-green-600 text-white opacity-50 cursor-not-allowed' : step === 1 ? 'bg-slate-700 hover:bg-slate-600 text-white animate-pulse shadow-lg ring-2 ring-pink-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
             >
                <Radio className="w-5 h-5" /> {t.pulse}
             </button>

             <button 
                onClick={handleRead}
                disabled={step !== 2}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${step === 3 ? 'bg-green-600 text-white opacity-50 cursor-not-allowed' : step === 2 ? 'bg-slate-700 hover:bg-slate-600 text-white animate-pulse shadow-lg ring-2 ring-purple-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
             >
                <Activity className="w-5 h-5" /> {t.read}
             </button>
        </div>

        {/* Simulation Box */}
        <div className="bg-slate-800 p-8 rounded-2xl border-2 border-dashed border-sky-500/30 relative min-h-[300px] flex flex-col items-center justify-center transition-all shadow-xl overflow-hidden">
             
             {/* Visual Protons */}
             <div className="flex flex-wrap justify-center gap-8 mb-8">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-700 ${
                            step === 0 ? 'bg-slate-600 text-slate-400 rotate-12' :
                            step === 1 ? 'bg-sky-500 text-white rotate-0 scale-110' :
                            step === 2 ? 'bg-pink-500 text-white rotate-90 scale-110' :
                            'bg-green-500 text-white rotate-0'
                        }`}
                        style={{
                            transform: step === 0 ? `rotate(${Math.random() * 360}deg)` : 
                                       step === 2 ? 'rotate(90deg)' : 'rotate(0deg)'
                        }}
                    >
                        ↑
                    </div>
                ))}
             </div>

             <div className="text-3xl sm:text-4xl font-mono tracking-widest text-sky-300 mb-6 transition-all duration-500 select-none min-h-[60px]">
                 {step === 0 && <span className="opacity-70">{t.initSim}</span>}
                 {step === 1 && <span className="text-sky-400 inline-block">{t.alignedSim}</span>}
                 {step === 2 && <span className="text-pink-400 inline-block animate-pulse">{t.pulsedSim}</span>}
                 {step === 3 && <span className="text-green-400">{t.readSim}</span>}
             </div>
             
             {step > 0 && (
                 <div className="text-lg font-bold text-white mt-4 animate-bounce bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700">
                     {step === 1 && t.alignedMsg}
                     {step === 2 && t.pulsedMsg}
                     {step === 3 && t.signalMsg}
                 </div>
             )}
        </div>

        {/* Reset */}
        {step === 3 && (
            <button 
                onClick={handleReset}
                className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all flex items-center gap-2 mx-auto shadow-lg hover:scale-105 active:scale-95"
            >
                <RotateCcw className="w-5 h-5" />
                {t.reset}
            </button>
        )}
      </div>
  );
};
