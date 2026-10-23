import React, { useState } from 'react';
import { BookOpen, X, ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
  language: 'English' | 'Arabic';
  onBack: () => void;
}

const FACTS = {
  Arabic: [
    { title: "🌤️ لماذا السماء زرقاء؟", text: "لأن ضوء الشمس يتشتت في الهواء، واللون الأزرق ينتشر أكثر من غيره." },
    { title: "🐱 لماذا تحب القطط الصناديق؟", text: "لأن الصناديق تجعل القطط تشعر بالأمان والدفء." },
    { title: "✈️ كيف تطير الطائرة؟", text: "أجنحة الطائرة تصنع فرق ضغط يرفعها في الهواء." },
    { title: "🌙 لماذا نرى القمر ليلاً؟", text: "لأن القمر يعكس ضوء الشمس نحو الأرض." },
    { title: "🦷 لماذا تتسوّس الأسنان؟", text: "بسبب البكتيريا التي تحب السكر وتُنتج أحماضًا." },
    { title: "🧠 لماذا ننام؟", text: "لأن الجسم والعقل يحتاجان للراحة وتجديد الطاقة." },
    { title: "🐘 لماذا الفيل كبير الحجم؟", text: "ليستطيع الاحتفاظ بالحرارة وحماية نفسه." },
    { title: "🌧️ من أين يأتي المطر؟", text: "من السحب عندما يبرد الهواء ويتكثف البخار." },
    { title: "🔥 لماذا النار حارة؟", text: "لأن التفاعل الكيميائي يُطلق طاقة حرارية." },
    { title: "🐟 كيف تتنفس الأسماك؟", text: "عن طريق الخياشيم التي تأخذ الأكسجين من الماء." },
    { title: "🦒 لماذا رقبة الزرافة طويلة؟", text: "لتصل إلى أوراق الأشجار العالية وتأكل بسهولة." },
    { title: "🐝 كيف يصنع النحل العسل؟", text: "يجمع النحل رحيق الأزهار ويحوّله إلى عسل داخل الخلية." },
    { title: "🌋 لماذا تثور البراكين؟", text: "بسبب ضغط المواد الساخنة داخل الأرض." },
    { title: "🧲 لماذا ينجذب الحديد للمغناطيس؟", text: "لأن الحديد يتأثر بالمجال المغناطيسي." },
    { title: "🐧 لماذا لا تطير البطاريق؟", text: "لأن أجنحتها تطورت للسباحة بدل الطيران." },
    { title: "🌍 لماذا الأرض كروية؟", text: "بسبب قوة الجاذبية التي تشد كل شيء نحو المركز." },
    { title: "🦴 لماذا عظامنا قوية؟", text: "لأنها تحتوي على الكالسيوم والمعادن." },
    { title: "🐢 لماذا السلحفاة بطيئة؟", text: "لأن جسمها ثقيل ودرعها صلب." },
    { title: "🌪️ ما هو الإعصار؟", text: "رياح قوية جدًا تدور بسرعة كبيرة." },
    { title: "🐦 كيف تطير الطيور؟", text: "تحرّك أجنحتها لتوليد قوة ترفعها في الهواء." },
    { title: "🌡️ لماذا نشعر بالحر؟", text: "لأن الجسم يحاول تنظيم درجة حرارته." },
    { title: "🐸 لماذا يقفز الضفدع؟", text: "لأن أرجله الخلفية قوية جدًا." },
    { title: "🌌 ما هي المجرّة؟", text: "مجموعة ضخمة من النجوم والكواكب." },
    { title: "🦷 لماذا يسقط سنّ اللبن؟", text: "لأن الأسنان الدائمة تنمو مكانه." }
  ],
  English: [
    { title: "🌤️ Why is the sky blue?", text: "Because blue light scatters more in the atmosphere." },
    { title: "🐱 Why do cats love boxes?", text: "Boxes make cats feel safe and relaxed." },
    { title: "✈️ How do planes fly?", text: "Wings create air pressure that lifts the plane." },
    { title: "🌙 Why do we see the moon?", text: "Because it reflects sunlight." },
    { title: "🦷 Why do teeth decay?", text: "Bacteria use sugar to create acids." },
    { title: "🧠 Why do we sleep?", text: "To rest and recharge the brain and body." },
    { title: "🐘 Why are elephants so big?", text: "To protect themselves and manage body heat." },
    { title: "🌧️ Where does rain come from?", text: "From clouds when water vapor cools." },
    { title: "🔥 Why is fire hot?", text: "Because chemical reactions release heat." },
    { title: "🐟 How do fish breathe?", text: "Using gills to take oxygen from water." },
    { title: "🦒 Why do giraffes have long necks?", text: "To reach high tree leaves easily." },
    { title: "🐝 How do bees make honey?", text: "They collect flower nectar and turn it into honey." },
    { title: "🌋 Why do volcanoes erupt?", text: "Because hot materials build pressure underground." },
    { title: "🧲 Why does metal stick to magnets?", text: "Because metal reacts to magnetic fields." },
    { title: "🐧 Why can't penguins fly?", text: "Their wings evolved for swimming." },
    { title: "🌍 Why is Earth round?", text: "Gravity pulls everything toward the center." },
    { title: "🦴 Why are bones strong?", text: "They contain calcium and minerals." },
    { title: "🐢 Why are turtles slow?", text: "They have heavy bodies and shells." },
    { title: "🌪️ What is a tornado?", text: "A very strong spinning wind." },
    { title: "🐦 How do birds fly?", text: "By moving their wings to lift themselves." },
    { title: "🌡️ Why do we feel hot?", text: "The body tries to control its temperature." },
    { title: "🐸 Why do frogs jump?", text: "They have very strong back legs." },
    { title: "🌌 What is a galaxy?", text: "A huge group of stars and planets." },
    { title: "🦷 Why do baby teeth fall out?", text: "Permanent teeth grow underneath." }
  ]
};

export const ReadAndLearn: React.FC<Props> = ({ language, onBack }) => {
  const [selectedFact, setSelectedFact] = useState<typeof FACTS['English'][0] | null>(null);
  
  const isAr = language === 'Arabic';
  const currentFacts = FACTS[language];
  
  const t = {
    title: isAr ? "اقرأ وتعلّم" : "Read & Learn",
    subtitle: isAr ? "معلومات سريعة وممتعة في أقل من دقيقة" : "Fun and quick facts in less than a minute",
    quickFact: isAr ? "اقرأ معلومة سريعة" : "Quick fact",
    gotIt: isAr ? "فهمت ✅" : "Got it ✅",
    back: isAr ? "العودة للقصص" : "Back to Stories",
    random: isAr ? "🎲 معلومة عشوائية" : "🎲 Random Fact",
  };

  const handleRandomFact = () => {
    const random = currentFacts[Math.floor(Math.random() * currentFacts.length)];
    setSelectedFact(random);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 animate-fade-in flex-1 flex flex-col items-center">
        
        <div className="text-center mb-12 mt-4">
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 flex items-center justify-center gap-4">
                <BookOpen className="w-12 h-12 text-emerald-400" />
                {t.title}
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">{t.subtitle}</p>
            
            <div className="flex flex-wrap gap-4 justify-center mt-6">
                <button 
                    onClick={handleRandomFact}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-extrabold text-lg rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                >
                    {t.random}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
            {currentFacts.map((item, idx) => (
                <div 
                    key={idx}
                    onClick={() => setSelectedFact(item)}
                    className="bg-slate-800 p-6 rounded-[24px] cursor-pointer hover:bg-slate-700 hover:-translate-y-2 transition-all border-2 border-slate-700 hover:border-emerald-500/50 shadow-xl group flex flex-col items-start h-full"
                >
                    <div className="bg-slate-900/50 p-3 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h4 className="font-bold text-white mb-auto group-hover:text-emerald-300 transition-colors text-xl leading-snug">{item.title}</h4>
                    <div className="w-full mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                        <small className="text-slate-500 font-bold text-xs uppercase tracking-wider">{t.quickFact}</small>
                        <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                            {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </span>
                    </div>
                </div>
            ))}
        </div>

        {selectedFact && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={() => setSelectedFact(null)}>
                <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-md w-full relative shadow-2xl transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                    <button 
                        onClick={() => setSelectedFact(null)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white rtl:left-4 rtl:right-auto"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                        <span className="text-3xl">💡</span>
                        <h3 className="text-2xl font-bold text-emerald-400">{selectedFact.title}</h3>
                    </div>
                    <p className="text-lg text-slate-200 leading-relaxed mb-8 font-medium">{selectedFact.text}</p>
                    
                    <button 
                        onClick={() => setSelectedFact(null)}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors shadow-lg active:scale-95 text-lg"
                    >
                        {t.gotIt}
                    </button>
                </div>
            </div>
        )}

        <div className="w-full mt-12 mb-8 flex justify-center">
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