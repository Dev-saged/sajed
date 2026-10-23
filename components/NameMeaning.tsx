import React, { useState, useEffect } from 'react';
import { Sparkles, Globe, Heart, Book, ArrowLeft, ArrowRight, Wand2 } from 'lucide-react';
import { generateNameMeaning } from '../services/gemini';

interface Props {
  language: 'English' | 'Arabic';
  onBack: () => void;
}

export const NameMeaning: React.FC<Props> = ({ language, onBack }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{meaning: string, origin: string, traits: string} | null>(null);

  const isAr = language === 'Arabic';
  const t = {
    title: isAr ? "📛 معنى اسمك" : "📛 Name Meaning",
    desc: isAr ? "اكتب اسمك واكتشف ماذا يعني!" : "Type your name and discover what it means!",
    placeholder: isAr ? "اكتب اسمك هنا" : "Type your name here",
    btn: isAr ? "✨ اعرف معنى اسمك" : "✨ Discover your name meaning",
    meaning: isAr ? "📘 المعنى" : "📘 Meaning",
    origin: isAr ? "🌍 الأصل" : "🌍 Origin",
    traits: isAr ? "💖 الصفات" : "💖 Traits",
    loading: isAr ? "جاري اكتشاف معنى اسمك..." : "Discovering your name meaning...",
    back: isAr ? "رجوع" : "Back",
    subtitle: isAr ? "رحلة ممتعة في عالم الأسماء" : "A fun journey into names",
    voiceSelect: isAr ? "🎧 اختر الصوت:" : "🎧 Voice:",
    male: isAr ? "👨 صوت رجل" : "👨 Male",
    female: isAr ? "👩 صوت سيدة" : "👩 Female",
    readAll: isAr ? "🔊 قراءة الملخص" : "🔊 Read Summary",
    voiceError: isAr ? "⚠️ الصوت العربي غير مدعوم على جهازك حاليًا" : "⚠️ Voice not supported on this device.",
  };

  const handleSearch = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setResult(null);
    try {
        const data = await generateNameMeaning(name, language);
        setResult(data);
    } catch (e) {
        console.error(e);
        // Fallback handled in service or could be added here
    } finally {
        setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in flex flex-col items-center min-h-[500px]">
        
        {/* Styled Hero Header */}
        <div 
            className="relative w-full rounded-[18px] overflow-hidden bg-cover bg-center md:bg-bottom py-16 md:py-20 px-4 text-center mb-8 shadow-2xl border border-slate-700/50"
            style={{ 
                backgroundImage: "linear-gradient(rgba(10,15,30,0.65), rgba(10,15,30,0.85)), url('https://png.pngtree.com/thumb_back/fh260/background/20241231/pngtree-amusement-park-image_16505595.jpg')",
                minHeight: '260px'
            }}
        >
            {/* Glow Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none"></div>

            <h1 className="relative z-10 text-3xl md:text-5xl font-heading font-bold text-white mb-4 flex items-center justify-center gap-4">
                <span className="text-sky-400 drop-shadow-md">📛</span>
                <span className="drop-shadow-md">{t.title}</span>
            </h1>
            <p className="relative z-10 text-slate-200 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-sm leading-relaxed">
                {t.subtitle}
            </p>
        </div>

        {/* Search Box */}
        <div className="w-full max-w-lg bg-[#0f172a] p-6 rounded-[22px] shadow-2xl border border-slate-700">
            <label className="block text-slate-300 font-bold mb-3 text-lg">{t.desc}</label>
            <div className="flex flex-col gap-4">
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.placeholder}
                    className="w-full p-4 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none text-xl font-bold text-center"
                    autoFocus
                />
                
                <button 
                    onClick={handleSearch}
                    disabled={loading || !name.trim()}
                    className="w-full py-4 bg-gradient-to-br from-sky-400 to-green-500 hover:from-sky-300 hover:to-green-400 text-white font-extrabold text-xl rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Wand2 className="w-6 h-6 animate-spin" />
                            {t.loading}
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-6 h-6" />
                            {t.btn}
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* Results */}
        {result && (
            <>
            <div className="w-full max-w-3xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                {/* Meaning */}
                <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl hover:border-blue-500/50 transition-colors flex flex-col">
                    <div className="bg-blue-500/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <Book className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white text-center mb-2">{t.meaning}</h3>
                    <p className="text-slate-300 text-center leading-relaxed flex-1">{result.meaning}</p>
                </div>

                {/* Origin */}
                <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl hover:border-green-500/50 transition-colors flex flex-col">
                    <div className="bg-green-500/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <Globe className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white text-center mb-2">{t.origin}</h3>
                    <p className="text-slate-300 text-center leading-relaxed flex-1">{result.origin}</p>
                </div>

                {/* Traits */}
                <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl hover:border-pink-500/50 transition-colors flex flex-col">
                    <div className="bg-pink-500/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <Heart className="w-6 h-6 text-pink-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white text-center mb-2">{t.traits}</h3>
                    <p className="text-slate-300 text-center leading-relaxed flex-1">{result.traits}</p>
                </div>
            </div>
            </>
        )}

        <div className="mt-16">
            <button 
                onClick={onBack}
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-lg rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center gap-3 border border-slate-600"
            >
                {isAr ? <ArrowRight className="w-6 h-6"/> : <ArrowLeft className="w-6 h-6"/>}
                {t.back}
            </button>
        </div>
    </div>
  )
}