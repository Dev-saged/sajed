import React, { useState } from 'react';
import { GeneratorMotorGame } from './GeneratorMotorGame';
import { MagnetGame } from './MagnetGame';
import { FaultGame } from './FaultGame';
import { VolcanoGame } from './VolcanoGame';
import { ChemGame } from './ChemGame';
import { CatchGame } from './CatchGame';
import { MriGame } from './MriGame';
import { TransformerGame } from './TransformerGame';
import { CandyGame } from './CandyGame';
import { ArrowLeft, ArrowRight, Gamepad2, Zap, Magnet, Mountain, Flame, FlaskConical, Target, Brain, Activity, Candy } from 'lucide-react';

interface Props {
  language: 'English' | 'Arabic';
  onBack: () => void;
}

export const GamesDashboard: React.FC<Props> = ({ language, onBack }) => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const isAr = language === 'Arabic';

  const t = {
    title: isAr ? "الألعاب التعليمية التفاعلية" : "Interactive Educational Games",
    subtitle: isAr ? "تعلم – العب – افهم العلوم بطريقة ممتعة" : "Learn – Play – Understand Science in a fun way",
    back: isAr ? "العودة للقصص" : "Back to Stories",
    backToList: isAr ? "رجوع للقائمة" : "Back to Games List",
    play: isAr ? "ابدأ اللعبة" : "Start Game",
    games: [
        {
            id: 'candy',
            title: isAr ? "🍬 من سيربح البونبون" : "🍬 Win the Candy",
            desc: isAr ? "جاوب صح واجمع أكبر عدد من البونبون! أسئلة عامة وممتعة" : "Answer correctly and collect candies! Fun general questions.",
            icon: <Candy className="w-8 h-8 text-pink-400" />
        },
        {
            id: 'gen_motor',
            title: isAr ? "⚙️ أجزاء المولد والمحرك" : "⚙️ Generator vs Motor",
            desc: isAr ? "تعلم الفرق بين تحويل الطاقة في المولد والمحرك الكهربائي" : "Learn the difference in energy conversion between Generators and Motors",
            icon: <Zap className="w-8 h-8 text-yellow-400" />
        },
        {
            id: 'magnet',
            title: isAr ? "🧲 خواص المغناطيس" : "🧲 Magnet Properties",
            desc: isAr ? "استكشف التجاذب والتنافر والمواد المغناطيسية" : "Explore attraction, repulsion, and magnetic materials",
            icon: <Magnet className="w-8 h-8 text-red-500" />
        },
        {
            id: 'transformer',
            title: isAr ? "⚡ المحولات الكهربائية" : "⚡ Transformers",
            desc: isAr ? "تحدي تحديد نوع المحول (رافع/خافض) من عدد اللفات" : "Challenge: Identify transformer type (Step-up/Step-down) from coils",
            icon: <Activity className="w-8 h-8 text-sky-400" />
        },
        {
            id: 'faults',
            title: isAr ? "📐 أنواع الصدوع" : "📐 Fault Types",
            desc: isAr ? "اربط بين نوع الصدع الجيولوجي والقوة المسببة له (شد، ضغط، قص)" : "Match the geological fault type with its causing force (Tension, Compression, Shear)",
            icon: <Mountain className="w-8 h-8 text-emerald-500" />
        },
        {
            id: 'volcano',
            title: isAr ? "🌋 أنواع البراكين" : "🌋 Volcano Types",
            desc: isAr ? "اربط بين نوع البركان ومكان تشكله الجيولوجي" : "Match the volcano type with its geological formation location",
            icon: <Flame className="w-8 h-8 text-orange-500" />
        },
        {
            id: 'chem',
            title: isAr ? "🧪 رموز العناصر" : "🧪 Chemical Symbols",
            desc: isAr ? "اختبر معلوماتك في الرموز الكيميائية للعناصر" : "Test your knowledge of chemical element symbols",
            icon: <FlaskConical className="w-8 h-8 text-emerald-400" />
        },
        {
            id: 'catch',
            title: isAr ? "🎯 التقاط العناصر" : "🎯 Element Catch",
            desc: isAr ? "لعبة سرعة: التقط العنصر الكيميائي الصحيح قبل سقوطه!" : "Speed Game: Catch the correct element symbol before it falls!",
            icon: <Target className="w-8 h-8 text-sky-400" />
        },
        {
            id: 'mri',
            title: isAr ? "🧠 الرنين المغناطيسي" : "🧠 MRI Adventure",
            desc: isAr ? "اكتشف كيف يعمل جهاز الرنين المغناطيسي في خطوات بسيطة" : "Discover how MRI machines work in simple steps",
            icon: <Brain className="w-8 h-8 text-pink-400" />
        }
    ]
  };

  const renderActiveGame = () => {
      switch(activeGame) {
          case 'candy':
              return <CandyGame language={language} />;
          case 'gen_motor':
              return <GeneratorMotorGame language={language} />;
          case 'magnet':
              return <MagnetGame language={language} />;
          case 'faults':
              return <FaultGame language={language} />;
          case 'volcano':
              return <VolcanoGame language={language} />;
          case 'chem':
              return <ChemGame language={language} />;
          case 'catch':
              return <CatchGame language={language} />;
          case 'mri':
              return <MriGame language={language} />;
          case 'transformer':
              return <TransformerGame language={language} />;
          default:
              return null;
      }
  };

  if (activeGame) {
      return (
          <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in flex-1 flex flex-col">
              <div className="mb-6">
                <button 
                    onClick={() => setActiveGame(null)} 
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold px-4 py-2 bg-slate-800 rounded-xl"
                >
                    {isAr ? <ArrowRight className="w-5 h-5"/> : <ArrowLeft className="w-5 h-5"/>}
                    {t.backToList}
                </button>
              </div>
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 shadow-xl">
                  {renderActiveGame()}
              </div>
          </div>
      )
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 animate-fade-in flex-1 flex flex-col items-center">
        <div className="text-center mb-12 mt-4">
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 flex items-center justify-center gap-4">
                <Gamepad2 className="w-12 h-12 text-yellow-500" />
                {t.title}
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {t.games.map(g => (
                <div 
                    key={g.id} 
                    className="bg-slate-800 rounded-[24px] p-8 border-4 border-slate-700 hover:border-yellow-500 transition-all hover:scale-105 shadow-xl group flex flex-col items-center text-center"
                >
                    <div className="bg-slate-700 p-4 rounded-full mb-6 group-hover:bg-slate-600 transition-colors">
                        {g.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">{g.title}</h3>
                    <p className="text-slate-400 mb-8 text-base leading-relaxed">{g.desc}</p>
                    <button 
                        onClick={() => setActiveGame(g.id)}
                        className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold text-lg rounded-xl transition-all shadow-lg transform hover:-translate-y-1"
                    >
                        {t.play}
                    </button>
                </div>
            ))}
        </div>

        <div className="mt-16 text-center">
            <button 
                onClick={onBack}
                className="px-8 py-4 bg-gradient-to-br from-sky-400 to-green-500 text-[#022c22] font-bold text-lg rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center gap-3"
            >
                {isAr ? <ArrowRight className="w-6 h-6"/> : <ArrowLeft className="w-6 h-6"/>}
                {t.back}
            </button>
        </div>
    </div>
  );
};
