import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Sparkles, Languages, Palette, Settings, Users, FolderOpen, Play, Pause, Gift, Calculator, X, Calendar, Wand2, Clock, Star, Info, Image as ImageIcon, Upload, RefreshCw, Lock } from 'lucide-react';
import { StoryParams, AgeGroup } from '../types';
import { AGE_OPTIONS, ART_STYLE_OPTIONS, ARABIC_DIALECTS, getValidShareUrl, STORY_TYPE_OPTIONS } from '../constants';

const HelpTooltip = ({ text, isArabic }: { text: string; isArabic: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-flex items-center mx-2 z-30" ref={dropdownRef}>
      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
        className="text-slate-400 hover:text-brand-500 focus:outline-none transition-colors p-1"
        title="Help"
      >
        <Info className="w-[18px] h-[18px]" />
      </button>
      {isOpen && (
        <div className={`absolute bottom-full mb-2 ${isArabic ? 'right-0' : 'left-0'} w-64 p-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in font-normal leading-relaxed`}>
          {text}
        </div>
      )}
    </div>
  );
};

const CHANGELOG = [
  {
    version: "2.2",
    features: {
      English: [
        "Improved performance and stability",
        "Simplified story generation experience"
      ],
      Arabic: [
        "تحسين الأداء والاستقرار",
        "تبسيط تجربة إنشاء القصة"
      ]
    }
  },
  {
    version: "2.1",
    features: {
      English: [
        "Added Story Templates feature",
        "Improved story generation quality",
        "Better user experience for story selection"
      ],
      Arabic: [
        "إضافة ميزة قوالب القصص",
        "تحسين جودة توليد القصص",
        "تحسين تجربة اختيار نوع القصة"
      ]
    }
  },
  {
    version: "2.0",
    features: {
      English: [
        "Added editable image prompts per scene.",
        "Added regenerate image per scene.",
        "Improved story generation logic.",
        "Added bilingual support (Arabic / English).",
        "Added layout fixes for wide and vertical stories."
      ],
      Arabic: [
        "تحسين توليد الصور",
        "إمكانية تعديل برومبت كل مشهد",
        "تحسين القصة",
        "دعم العربية والإنجليزية",
        "تحسين العرض الطولي والعرضي"
      ]
    }
  }
];

const SURPRISE_PROMPTS = {
  English: [
    "A brave little rabbit named Hoppy who goes on a big adventure to learn how to help his forest friends in need.",
    "A cute curious cat discovering a magical world hidden behind the garden fence where flowers can sing and dance.",
    "A young child visiting the Dream World before bedtime to chase away bad dreams and find the brightest stars.",
    "A little friendly dinosaur looking for new friends in the prehistoric valley to play hide and seek with.",
    "A fun journey to space with a happy robot named Beep who loves to explore new planets and meet aliens.",
    "A magical fairy tale about a kind princess who loves sharing her toys and bringing joy to the kingdom.",
    "A cozy bedtime story about a brave little star guarding children while they sleep and bringing them sweet dreams.",
    "An exciting adventure in the deep green forest with cute animals working together to build a new playground."
  ],
  Arabic: [
    "قصة أرنب صغير شجاع يدعى لوز يذهب في مغامرة كبيرة ليتعلم كيف يساعد أصدقاءه في الغابة.",
    "مغامرة قطة لطيفة وفضولية تكتشف عالمًا سحريًا مخفيًا خلف سور الحديقة حيث الأزهار تغني وترقص.",
    "طفل صغير يزور عالم الأحلام السحري قبل النوم ليطرد الكوابيس ويبحث عن أجمل النجوم اللامعة.",
    "ديناصور صغير ودود يبحث عن أصدقاء جدد في الوادي الكبير ليلعب معهم لعبة الغميضة والمطاردة.",
    "رحلة ممتعة ومثيرة إلى الفضاء الخارجي مع روبوت مرح يحب استكشاف الكواكب الجديدة ومقابلة الفضائيين.",
    "حكاية خيالية عن أميرة طيبة القلب تحب مشاركة ألعابها ونشر السعادة والفرح بين جميع سكان المملكة.",
    "قصة دافئة قبل النوم عن نجمة صغيرة شجاعة تحرس الأطفال أثناء نومهم وتهديهم أحلامًا سعيدة وجميلة.",
    "مغامرة شيقة في الغابة الخضراء مع مجموعة من الحيوانات اللطيفة التي تتعاون معًا لبناء ملعب جديد."
  ]
};

const SMART_TIPS = {
  English: {
    "3-4": "Write a very simple story about animals or colors 🧸",
    "4-6": "Choose a clear hero and a simple problem ✨",
    "7-9": "Add an exciting adventure with connected events 🗺️",
    "9-12": "Think about a real challenge and a meaningful message 🌟"
  },
  Arabic: {
    "3-4": "اكتب قصة بسيطة عن حيوان لطيف أو لون جميل 🧸",
    "4-6": "اختَر بطلًا واضحًا ومشكلة بسيطة يحاول حلّها ✨",
    "7-9": "أضف مغامرة ممتعة وأحداثًا مترابطة 🗺️",
    "9-12": "فكّر في تحدّي حقيقي ورسالة مفيدة في القصة 🌟"
  }
};

// Kids Tools Translations
const TOOLS_TXT = {
  English: {
    simpleBtn: "🧒 Stories for your age",
    exactBtn: "🎂 Calculate exact age",
    calcBtn: "🔮 Fun Number Tool",
    mathBtn: "🧮 Kids Calculator",
    
    // Titles
    tab1: "📘 Stories for your age",
    tab2: "🎂 Calculate exact age",
    tab3: "🔮 Fun Number Tool",
    tab4: "🧮 Learning Calculator",
    
    // Inputs
    ageQ: "How old are you?",
    birthQ: "Your birth date",
    numQ: "Enter a number you like",
    
    // Actions
    calc: "Calculate",
    close: "Close",
    clear: "Clear",
    
    // Results
    fit: (age: number) => `📚 Best stories for age ${age}:`,
    group: (g: string) => `👉 Age group: ${g}`,
    exactResult: (r: any) => 
      `🎉 ${r.years} Years\n` +
      `📆 ${r.months} Months\n` +
      `📅 ${r.days} Days\n` +
      `🗓️ ${r.weeks} Weeks\n` +
      `⏰ ${r.hours} Hours\n` +
      `⏱️ ${r.seconds} Seconds`,
    
    lucky: (n: number) => `✨ Your lucky number is ${n}`,
    msgs: [
        "Smile 😊 today is great",
        "You are strong 💪",
        "Keep going 🌟",
        "You have a kind heart ❤️",
        "You are special 🌈"
    ]
  },
  Arabic: {
    simpleBtn: "🧒 القصة المناسبة لعمرك",
    exactBtn: "🎂 احسب عمرك بالتفصيل",
    calcBtn: "🔮 آلة أرقام ممتعة",
    mathBtn: "🧮 آلة حاسبة للأطفال",

    // Titles
    tab1: "📘 القصة المناسبة لعمرك",
    tab2: "🎂 احسب عمرك بالتفصيل",
    tab3: "🔮 آلة أرقام ممتعة",
    tab4: "🧮 آلة حاسبة تعليمية",

    // Inputs
    ageQ: "كام سنة عندك؟",
    birthQ: "تاريخ ميلادك",
    numQ: "اكتب رقم تحبه",

    // Actions
    calc: "احسب",
    close: "إغلاق",
    clear: "مسح",

    // Results
    fit: (age: number) => `📚 القصص المناسبة لسن ${age} سنة هي:`,
    group: (g: string) => `👉 الفئة العمرية: ${g}`,
    exactResult: (r: any) => 
      `🎉 ${r.years} سنة\n` +
      `📆 ${r.months} شهر\n` +
      `📅 ${r.days} يوم\n` +
      `🗓️ ${r.weeks} أسبوع\n` +
      `⏰ ${r.hours} ساعة\n` +
      `⏱️ ${r.seconds} ثانية`,
      
    lucky: (n: number) => `✨ رقم حظك هو ${n}`,
    msgs: [
        "ابتسم 😊 يومك جميل",
        "أنت شجاع 💪",
        "استمر… القادم أحلى 🌟",
        "قلبك طيب ❤️",
        "إنت مميز 🌈"
    ]
  }
};

// Word Count Limits & Validation
const PROMPT_LIMITS: Record<string, number> = {
    "3-4": 5,
    "4-6": 8,
    "7-9": 10,
    "9-12": 15
};

interface SetupFormProps {
  params: StoryParams;
  onChange: (newParams: StoryParams) => void;
  onSubmit: () => void;
  onLoadStory: () => void;
  isLoading: boolean;
  progress: number;
  progressMessage: string;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
}

const SetupForm: React.FC<SetupFormProps> = ({ 
  params, onChange, onSubmit, onLoadStory, isLoading, 
  progress, progressMessage, isPaused, onPause, onResume 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tools State
  const [activeTool, setActiveTool] = useState<'simple' | 'exact' | 'calc' | 'math' | null>(null);
  const [showChangelog, setShowChangelog] = useState(false);
  
  // Input States
  const [simpleAgeInput, setSimpleAgeInput] = useState('');
  const [birthDateInput, setBirthDateInput] = useState('');
  const [calcInput, setCalcInput] = useState('');
  
  // Math Tool State
  const [mathDisplay, setMathDisplay] = useState('');

  // Result State
  const [toolResult, setToolResult] = useState<string | null>(null);

  const handleChange = <K extends keyof StoryParams>(key: K, value: StoryParams[K]) => {
    onChange({ ...params, [key]: value });
  };

  const handleLanguageChange = (lang: 'English' | 'Arabic') => {
    if (isLoading) return;
    onChange({
        ...params,
        language: lang,
        dialect: lang === 'English' ? 'Standard American English' : 'Standard Arabic' // Default dialect
    });
  };

  const handleDialectChange = (dialect: string) => {
    if (isLoading) return;
    handleChange('dialect', dialect);
  };

  const handleSurpriseMe = () => {
    const prompts = SURPRISE_PROMPTS[params.language];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    handleChange('idea', randomPrompt);
    // Focus the textarea after setting the value for better UX
    setTimeout(() => {
        textareaRef.current?.focus();
    }, 0);
  };

  const determineAgeGroup = (age: number): AgeGroup => {
    if (age <= 4) return '3-4';
    if (age <= 6) return '4-6';
    if (age <= 9) return '7-9';
    return '9-12';
  };

  const closeTool = () => {
    setActiveTool(null);
    setToolResult(null);
    setMathDisplay('');
  };

  const handleSimpleAgeCalc = () => {
    const age = parseInt(simpleAgeInput);
    if (!age) return;

    const group = determineAgeGroup(age);
    handleChange('ageGroup', group);

    const txt = TOOLS_TXT[params.language];
    const groupOption = AGE_OPTIONS.find(o => o.id === group);
    const groupTitle = params.language === 'Arabic' ? groupOption?.titleAr : groupOption?.title;

    setToolResult(`${txt.fit(age)}\n${txt.group(groupTitle || group)}`);
  };

  const handleExactAgeCalc = () => {
    if (!birthDateInput) return;

    const now = new Date();
    const d = new Date(birthDateInput);
    const diff = now.getTime() - d.getTime();

    if (diff < 0) return; // Future date

    const stats = {
      years: Math.floor(diff / (365.25*24*3600*1000)),
      months: Math.floor(diff / (30.44*24*3600*1000)),
      days: Math.floor(diff / (24*3600*1000)),
      weeks: Math.floor(diff / (7*24*3600*1000)),
      hours: Math.floor(diff / (3600*1000)),
      seconds: Math.floor(diff / 1000)
    };

    const group = determineAgeGroup(stats.years);
    handleChange('ageGroup', group);

    const txt = TOOLS_TXT[params.language];
    const groupOption = AGE_OPTIONS.find(o => o.id === group);
    const groupTitle = params.language === 'Arabic' ? groupOption?.titleAr : groupOption?.title;

    setToolResult(`${txt.exactResult(stats)}\n\n${txt.group(groupTitle || group)}`);
  };

  const handleFunCalc = () => {
    const n = Math.abs(parseInt(calcInput) || 0);
    const lucky = (n % 9) + 1;
    const txt = TOOLS_TXT[params.language];
    const msg = txt.msgs[Math.floor(Math.random() * txt.msgs.length)];
    
    setToolResult(`${txt.lucky(lucky)}\n${msg}`);
  };

  const handleMathInput = (val: string) => {
    if (val === 'C') {
        setMathDisplay('');
        return;
    }
    if (val === '=') {
        try {
            // Replace visual operators with JS operators
            const expr = mathDisplay
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-')
                .replace(/\+/g, '+');
            
            // Safety check
            if (!expr || !/^[\d.+\-*/()\s]+$/.test(expr)) {
                setMathDisplay('Error');
                return;
            }

            // Calculate
            // eslint-disable-next-line no-new-func
            const res = new Function(`return ${expr}`)();
            
            // Format to avoid long decimals and ensure string
            const final = Number.isInteger(res) ? res : Number(res.toFixed(4));
            setMathDisplay(String(final));
        } catch {
            setMathDisplay('Error');
        }
        return;
    }
    
    if (mathDisplay === 'Error') {
        setMathDisplay(val);
    } else {
        setMathDisplay(prev => prev + val);
    }
  };

  const getSceneReadingTime = () => {
    const scenes = params.pageCount;
    const totalSeconds = scenes * 25;
    const isAr = params.language === 'Arabic';

    if (totalSeconds < 60) {
        return isAr ? "أقل من دقيقة" : "Less than a minute";
    }
    const minutes = Math.round(totalSeconds / 60);
    if (minutes < 60) {
        return isAr ? `${minutes} دقيقة` : `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (isAr) {
        return `${hours} ساعة${mins ? ` و ${mins} دقيقة` : ''}`;
    }
    return `${hours} hr${mins ? ` ${mins} min` : ''}`;
  };

  const t = {
    English: {
      storyAbout: "What is your story about?",
      storyPlaceholder: "e.g., A brave little rabbit who wants to fly to the moon...",
      storyType: "Story Type",
      ageGroup: "Age Group",
      language: "Language",
      storySettings: "Story Settings",
      artStyle: "Art Style",
      createBtn: "Create My Story!",
      loadStory: "Load Story",
      generatingTitle: "Weaving your story...",
      pause: "Pause",
      resume: "Resume",
      settingsTitle: "📖 Story Settings",
      short: "Short (6)",
      fun: "Medium (12)",
      scenesLabel: "🎬 Number of Scenes",
      sceneUnit: "Scene",
      mobile: "📱 Mobile",
      bigScreen: "🖥️ Big Screen",
      langTitle: "🌍 Language",
      surpriseMe: "Surprise Me",
      readingTime: "⏱️ Reading time (input):",
      shortWarn: "⚠️ The story idea is too short. Please write more details.",
      minutes: "min",
      help: {
        storyAbout: "Describe what the story is about.",
        storyType: "Choose the type of story to control tone and style.",
        ageGroup: "Select the appropriate age to adjust language simplicity.",
        language: "Choose the language for the text of your story.",
        storySettings: "Choose how many pages the story should have and the aspect ratio.",
        artStyle: "Select how the images should look."
      }
    },
    Arabic: {
      storyAbout: "عن ماذا تدور القصة؟",
      storyPlaceholder: "عن ماذا تدور القصة؟ (مثلاً: أرنب شجاع يريد الطيران...)",
      storyType: "نوع القصة",
      ageGroup: "الفئة العمرية",
      language: "اللغة",
      storySettings: "إعدادات القصة",
      artStyle: "أسلوب الرسم",
      createBtn: "ابدأ القصة!",
      loadStory: "تحميل قصة",
      generatingTitle: "جارٍ نسج قصتك...",
      pause: "إيقاف مؤقت",
      resume: "استئناف",
      settingsTitle: "📖 إعدادات القصة",
      short: "قصيرة (6)",
      fun: "متوسطة (12)",
      scenesLabel: "🎬 عدد المشاهد",
      sceneUnit: "مشهد",
      mobile: "📱 موبايل",
      bigScreen: "🖥️ شاشة كبيرة",
      langTitle: "🌍 اللغة",
      surpriseMe: "فاجئني بقصة!",
      readingTime: "⏱️ قراءة النص (مدخل):",
      shortWarn: "⚠️ النص قصير جدًا، من فضلك اكتب فكرة أوضح للقصة",
      minutes: "دقائق",
      help: {
        storyAbout: "أدخل وصفاً لفكرة القصة بأسلوبك الخاص.",
        storyType: "اختر نوع القصة لتحديد الأسلوب والنبرة.",
        ageGroup: "اختر الفئة العمرية لتبسيط اللغة.",
        language: "اختر لغة النص والقصة المكتوبة.",
        storySettings: "اختر عدد صفحات القصة وحجم وشكل الشاشة.",
        artStyle: "اختر شكل الرسومات."
      }
    }
  };

  const txt = t[params.language];
  const toolsTxt = TOOLS_TXT[params.language];
  const isArabic = params.language === 'Arabic';

  // Logic for Validation
  const wordCount = params.idea.trim().split(/\s+/).filter(Boolean).length;
  const minWords = PROMPT_LIMITS[params.ageGroup];
  const isTooShort = wordCount > 0 && wordCount < minWords;

  return (
    <div className="w-full max-w-4xl mx-auto card rounded-[18px] shadow-xl overflow-hidden border-4 border-brand-100 dark:border-slate-700 transition-colors duration-300">
      
      {/* Changelog Modal */}
      {showChangelog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowChangelog(false)}>
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full relative shadow-2xl overflow-y-auto max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={() => setShowChangelog(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white rtl:left-4 rtl:right-auto"
                >
                    <X className="w-5 h-5" />
                </button>
                
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="bg-brand-500 text-white text-xs px-2 py-1 rounded">NEW</span>
                    {isArabic ? "ما الجديد؟" : "What's New"}
                </h2>

                <div className="space-y-6">
                    {CHANGELOG.map((log, i) => (
                        <div key={i} className="border-l-2 border-brand-500 pl-4 rtl:pl-0 rtl:border-l-0 rtl:border-r-2 rtl:pr-4">
                            <h3 className="text-lg font-bold text-sky-400 mb-3">
                                {isArabic ? `الإصدار ${log.version}` : `Version ${log.version}`}
                            </h3>
                            <ul className="space-y-2">
                                {(isArabic ? log.features.Arabic : log.features.English).map((feat, j) => (
                                    <li key={j} className="text-slate-300 text-sm flex items-start gap-2">
                                        <span className="text-brand-500 mt-1.5">•</span>
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Kids Tools Modal */}
      {activeTool && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          {/* Modal Container: Max width adjusts based on tool */}
          <div className="bg-[#0f172a] text-white p-6 rounded-2xl shadow-2xl w-full relative text-center border border-slate-700 transition-all max-w-sm">
            <button 
                onClick={closeTool}
                className="absolute top-3 right-3 text-slate-400 hover:text-white rtl:left-3 rtl:right-auto"
            >
                <X className="w-5 h-5" />
            </button>
            
            {/* Simple Tab Content */}
            {activeTool === 'simple' && (
                <div className="animate-fade-in">
                    <h3 className="text-xl font-bold mb-4 text-sky-400">{toolsTxt.tab1}</h3>
                    <div className="mb-4 text-lg font-medium flex items-center justify-center gap-2">
                        <BookOpen className="w-5 h-5 text-sky-400" />
                        {toolsTxt.ageQ}
                    </div>
                    <input 
                        type="number" 
                        min="2" 
                        max="12"
                        value={simpleAgeInput}
                        onChange={(e) => setSimpleAgeInput(e.target.value)}
                        className="w-full p-3 rounded-xl border-none bg-slate-800 text-white text-center font-bold text-xl outline-none focus:ring-2 focus:ring-sky-500 mb-4"
                        placeholder="5"
                        autoFocus
                    />
                    <button 
                        onClick={handleSimpleAgeCalc}
                        className="w-full py-3 bg-[#38bdf8] hover:bg-[#0ea5e9] text-black font-bold rounded-xl transition-all shadow-lg"
                    >
                        {toolsTxt.calc}
                    </button>
                </div>
            )}

            {/* Exact Tab Content */}
            {activeTool === 'exact' && (
                <div className="animate-fade-in">
                    <h3 className="text-xl font-bold mb-4 text-purple-400">{toolsTxt.tab2}</h3>
                    <div className="mb-4 text-lg font-medium flex items-center justify-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        {toolsTxt.birthQ}
                    </div>
                    <input 
                        type="date" 
                        value={birthDateInput}
                        onChange={(e) => setBirthDateInput(e.target.value)}
                        className="w-full p-3 rounded-xl border-none bg-slate-800 text-white text-center font-bold text-lg outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                    />
                    <button 
                        onClick={handleExactAgeCalc}
                        className="w-full py-3 bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold rounded-xl transition-all shadow-lg"
                    >
                        {toolsTxt.calc}
                    </button>
                </div>
            )}

            {/* Fun Number Tab Content */}
            {activeTool === 'calc' && (
                <div className="animate-fade-in">
                    <h3 className="text-xl font-bold mb-4 text-emerald-400">{toolsTxt.tab3}</h3>
                    <div className="mb-4 text-lg font-medium flex items-center justify-center gap-2">
                        <Wand2 className="w-5 h-5 text-emerald-400" />
                        {toolsTxt.numQ}
                    </div>
                    <input 
                        type="number" 
                        value={calcInput}
                        onChange={(e) => setCalcInput(e.target.value)}
                        className="w-full p-3 rounded-xl border-none bg-slate-800 text-white text-center font-bold text-xl outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
                        placeholder="7"
                        autoFocus
                    />
                    <button 
                        onClick={handleFunCalc}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-all shadow-lg"
                    >
                        {toolsTxt.calc}
                    </button>
                </div>
            )}

            {/* Kids Calculator Tab Content */}
            {activeTool === 'math' && (
                <div className="animate-fade-in">
                     <h3 className="text-xl font-bold mb-4 text-orange-400">{toolsTxt.tab4}</h3>
                     <div className="bg-slate-700/50 p-4 rounded-2xl">
                         <input 
                             type="text" 
                             readOnly 
                             value={mathDisplay} 
                             className="w-full p-3 mb-4 bg-slate-900 text-right text-2xl font-mono text-white rounded-lg border border-slate-600 focus:outline-none"
                             placeholder="0"
                         />
                         <div className="grid grid-cols-4 gap-2">
                             {['7','8','9','÷','4','5','6','×','1','2','3','-','0','=','+','C'].map((btn) => (
                                 <button
                                     key={btn}
                                     onClick={() => handleMathInput(btn)}
                                     className={`
                                         p-3 rounded-lg font-bold text-lg transition-all shadow-sm active:scale-95
                                         ${btn === 'C' ? 'bg-red-500 hover:bg-red-600 text-white' : 
                                           btn === '=' ? 'bg-green-500 hover:bg-green-600 text-white' : 
                                           ['÷','×','-','+'].includes(btn) ? 'bg-orange-500 hover:bg-orange-600 text-white' : 
                                           'bg-slate-600 hover:bg-slate-500 text-white'}
                                     `}
                                 >
                                     {btn}
                                 </button>
                             ))}
                         </div>
                     </div>
                </div>
            )}

            {/* Results */}
            {toolResult && (
                <div className="mt-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700 animate-fade-in">
                    <p className="whitespace-pre-line text-sm md:text-base font-bold leading-relaxed text-yellow-300">
                        {toolResult}
                    </p>
                </div>
            )}
            
            <button 
                onClick={closeTool}
                className="mt-6 text-slate-400 hover:text-white text-sm font-bold underline decoration-dotted"
            >
                {toolsTxt.close}
            </button>
          </div>
        </div>
      )}

      <div 
        className="relative py-8 px-5 text-center overflow-hidden transition-colors duration-300 bg-slate-900"
        style={{
           backgroundImage: `linear-gradient(to bottom, rgba(10,15,30,0.55), rgba(10,15,30,0.9)), url('https://png.pngtree.com/thumb_back/fh260/background/20241231/pngtree-amusement-park-image_16505595.jpg')`,
           backgroundSize: 'cover',
           backgroundPosition: 'center bottom',
           backgroundRepeat: 'no-repeat',
           minHeight: '260px'
        }}
      >
        {/* Load Story Button */}
        <div className="absolute top-6 right-6 z-20 rtl:left-6 rtl:right-auto">
            <button 
                id="loadStory"
                onClick={onLoadStory}
                disabled={isLoading}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl backdrop-blur-md border border-white/30 font-bold flex items-center gap-2 transition-all shadow-lg text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FolderOpen className="w-5 h-5" />
                <span className="hidden sm:inline">{txt.loadStory}</span>
            </button>
        </div>

        <div className="relative z-10">
            <div className="inline-flex items-center justify-center p-3 card rounded-full shadow-lg mb-4">
                <BookOpen className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex items-center justify-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-white shadow-sm">
                    Sawan Kids Story Studio
                </h1>
                <span 
                    onClick={() => setShowChangelog(true)}
                    className="version-badge"
                    title={isArabic ? "اضغط لمعرفة الجديد" : "Click to see what's new"}
                >
                    V2.2
                </span>
            </div>
            <p className="text-white font-medium text-lg drop-shadow-md">Create magical stories in seconds!</p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        
        {/* Story Idea */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center text-gray-700 dark:text-gray-200 font-bold font-heading text-xl">
                <Sparkles className="w-6 h-6 me-2 text-yellow-500" />
                {txt.storyAbout}
                <HelpTooltip text={txt.help.storyAbout} isArabic={isArabic} />
            </label>
            <button
                type="button"
                onClick={handleSurpriseMe}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-yellow-400 to-rose-400 text-slate-900 font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Gift className="w-4 h-4" />
                {txt.surpriseMe}
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={params.idea}
            onChange={(e) => handleChange('idea', e.target.value)}
            placeholder={txt.storyPlaceholder}
            dir="auto"
            disabled={isLoading}
            className={`w-full p-4 border-2 rounded-2xl focus:ring-4 transition-all outline-none resize-none h-32 text-gray-700 dark:text-gray-200 card text-lg placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-70 disabled:cursor-not-allowed
              ${isTooShort 
                ? 'border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900' 
                : 'border-brand-100 dark:border-slate-700 focus:border-brand-400 dark:focus:border-brand-400 focus:ring-brand-100 dark:focus:ring-brand-900'
              }
            `}
          />

          <div className="flex flex-col gap-2">
            {/* Smart Tips by Age */}
            <div className="text-[13px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-white/5 px-3 py-2.5 rounded-xl border border-slate-200/50 dark:border-white/5 transition-colors">
                <span className="me-2">💡</span>
                {SMART_TIPS[params.language][params.ageGroup]}
            </div>
            
            {/* Native Kids Tools Triggers - 4 Buttons (Science Removed) */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
                 <button
                    onClick={() => { setActiveTool('simple'); setToolResult(null); }}
                    className="flex items-center gap-2 text-[12px] sm:text-[13px] font-bold text-slate-700 dark:text-slate-200 bg-sky-400/20 hover:bg-sky-400/30 px-3 py-2 rounded-xl transition-colors border border-sky-400/20"
                 >
                    <BookOpen className="w-4 h-4" />
                    {toolsTxt.simpleBtn}
                 </button>
                 
                 <button
                    onClick={() => { setActiveTool('exact'); setToolResult(null); }}
                    className="flex items-center gap-2 text-[12px] sm:text-[13px] font-bold text-slate-700 dark:text-slate-200 bg-purple-400/20 hover:bg-purple-400/30 px-3 py-2 rounded-xl transition-colors border border-purple-400/20"
                 >
                    <Calendar className="w-4 h-4" />
                    {toolsTxt.exactBtn}
                 </button>

                 <button
                    onClick={() => { setActiveTool('calc'); setToolResult(null); }}
                    className="flex items-center gap-2 text-[12px] sm:text-[13px] font-bold text-slate-700 dark:text-slate-200 bg-emerald-400/20 hover:bg-emerald-400/30 px-3 py-2 rounded-xl transition-colors border border-emerald-400/20"
                 >
                    <Wand2 className="w-4 h-4" />
                    {toolsTxt.calcBtn}
                 </button>

                 <button
                    onClick={() => { setActiveTool('math'); setToolResult(null); }}
                    className="flex items-center gap-2 text-[12px] sm:text-[13px] font-bold text-slate-700 dark:text-slate-200 bg-orange-400/20 hover:bg-orange-400/30 px-3 py-2 rounded-xl transition-colors border border-orange-400/20"
                 >
                    <Calculator className="w-4 h-4" />
                    {toolsTxt.mathBtn}
                 </button>
            </div>

            {/* Reading Info & Validation */}
            {wordCount > 0 && (
                <>
                {isTooShort && (
                    <div className="text-[13px] font-bold text-red-500 bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/20 animate-pulse">
                        {txt.shortWarn}
                    </div>
                )}
                </>
            )}
          </div>
        </div>

        {/* Story Type */}
        <div className="space-y-4">
          <label className="flex items-center text-gray-700 dark:text-gray-200 font-bold font-heading text-xl">
            <Star className="w-6 h-6 me-2 text-rose-500" />
            {txt.storyType}
            <HelpTooltip text={txt.help.storyType} isArabic={isArabic} />
          </label>
          
          <div className="age-grid">
            {STORY_TYPE_OPTIONS.map((option) => {
              const isSelected = params.storyType === option.id;
              const label = isArabic ? option.labelAr : option.label;
              
              return (
                <div
                  key={option.id}
                  onClick={() => !isLoading && handleChange('storyType', option.id)}
                  className={`age-card age-${option.color} ${isSelected ? 'active' : ''} ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className="age-range title mt-2">{label}</span>
                  <div className="check">✓</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Age Group */}
        <div className="space-y-4">
          <label className="flex items-center text-gray-700 dark:text-gray-200 font-bold font-heading text-xl">
            <Users className="w-6 h-6 me-2 text-purple-500" />
            {txt.ageGroup}
            <HelpTooltip text={txt.help.ageGroup} isArabic={isArabic} />
          </label>
          
          <div className="age-grid">
            {AGE_OPTIONS.map((option) => {
              const isSelected = params.ageGroup === option.id;
              const title = isArabic ? option.titleAr : option.title;
              const desc = isArabic ? option.descAr : option.desc;
              
              return (
                <div
                  key={option.id}
                  onClick={() => !isLoading && handleChange('ageGroup', option.id)}
                  className={`age-card age-${option.color} ${isSelected ? 'active' : ''} ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className="age-range title">{title}</span>
                  <div className="mt-2 text-xs text-slate-100/90 bg-white/10 px-2 py-1.5 rounded-lg leading-tight min-h-[40px] flex items-center justify-center description">
                    {desc}
                  </div>
                  <div className="check">✓</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Language & Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Sawan Language & Dialect Engine */}
          <div className="space-y-4">
            <div className="bg-[#0f172a] rounded-2xl p-4 text-white shadow-lg border border-slate-700">
                <div className="text-sm opacity-90 mb-3 font-bold flex items-center gap-2">
                   <Languages className="w-4 h-4 text-sky-400" /> 
                   {txt.langTitle}
                   <HelpTooltip text={txt.help.language} isArabic={isArabic} />
                </div>

                <div className="flex gap-2 mb-4">
                    <button 
                        onClick={() => handleLanguageChange('English')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all text-center ${
                            params.language === 'English' 
                            ? 'bg-[#0ea5e9] text-white' 
                            : 'bg-[#1e293b] text-slate-300 hover:bg-slate-800'
                        } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        🇺🇸 US English
                    </button>
                    <button 
                        onClick={() => handleLanguageChange('Arabic')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all text-center ${
                            params.language === 'Arabic' 
                            ? 'bg-[#0ea5e9] text-white' 
                            : 'bg-[#1e293b] text-slate-300 hover:bg-slate-800'
                        } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        🇸🇦 AR العربية
                    </button>
                </div>

                {params.language === 'Arabic' && (
                    <div className="animate-fade-in mt-2">
                         <div className="flex flex-wrap gap-2">
                             {ARABIC_DIALECTS.map(d => (
                                 <button
                                     key={d.id}
                                     onClick={() => handleDialectChange(d.id)}
                                     disabled={isLoading}
                                     data-dialect={d.id}
                                     className={`sawan-dialect px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                         params.dialect === d.id
                                         ? 'bg-[#22c55e] text-black shadow-md'
                                         : 'bg-[#1e293b] text-slate-300 hover:bg-slate-800'
                                     } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                 >
                                     <span className="text-base">{d.flag}</span>
                                     <span>{d.label}</span>
                                 </button>
                             ))}
                         </div>
                    </div>
                )}
            </div>
          </div>

          {/* New Sawan Story Settings (Style A) */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] p-5 rounded-[20px] text-white font-sans shadow-lg h-full flex flex-col justify-between">
                <div>
                    <div className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-yellow-300" />
                        {txt.settingsTitle}
                        <HelpTooltip text={txt.help.storySettings} isArabic={isArabic} />
                    </div>

                    {/* Length Cards */}
                    <div className="flex gap-2 mb-4">
                    {[
                        { label: txt.short, val: 6 },
                        { label: txt.fun, val: 12 }
                    ].map((item) => (
                        <button
                        key={item.val}
                        onClick={() => !isLoading && handleChange('pageCount', item.val)}
                        disabled={isLoading}
                        className={`flex-1 bg-white text-gray-900 rounded-xl py-3 px-1 text-center cursor-pointer transition-all font-bold text-xs sm:text-sm ${
                            params.pageCount === item.val 
                            ? '!bg-yellow-400 !text-black transform scale-105 shadow-md ring-2 ring-white/30' 
                            : 'hover:bg-gray-100 opacity-90 hover:opacity-100'
                        } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                        {item.label}
                        </button>
                    ))}
                    </div>

                    {/* Slider Box */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4 border border-white/20">
                    <div className="font-bold mb-3 flex items-center justify-between text-xs text-white/90">
                        <span>{txt.scenesLabel}</span>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => !isLoading && handleChange('pageCount', Math.max(3, params.pageCount - 1))}
                                disabled={isLoading || params.pageCount <= 3}
                                className="w-7 h-7 rounded-full bg-white/20 text-white hover:bg-white/30 shadow-[0_0_8px_rgba(255,255,255,0.1)] hover:shadow-[0_0_12px_rgba(255,255,255,0.2)] flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                -
                            </button>
                            <span className="bg-green-500 px-3 py-1 rounded-lg text-white font-bold min-w-[32px] text-center">{params.pageCount}</span>
                            <button 
                                onClick={() => !isLoading && handleChange('pageCount', Math.min(20, params.pageCount + 1))}
                                disabled={isLoading || params.pageCount >= 20}
                                className="w-7 h-7 rounded-full bg-blue-500 text-white hover:bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.6)] hover:shadow-[0_0_15px_rgba(59,130,246,0.9)] flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <input 
                        type="range" 
                        min="3" 
                        max="20"
                        value={params.pageCount}
                        onChange={(e) => !isLoading && handleChange('pageCount', parseInt(e.target.value))}
                        disabled={isLoading}
                        className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    />
                    <div className="mt-2 text-[13px] text-slate-300 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {params.language === 'Arabic' ? 'مدة القراءة التقريبية:' : 'Estimated reading time:'} {getSceneReadingTime()}
                    </div>
                    {params.pageCount > 12 && (
                        <div className="mt-2 text-xs text-yellow-300 font-medium flex items-start gap-1.5">
                            <Info className="w-4 h-4 shrink-0 mt-0.5" />
                            <span className="leading-tight">
                                {params.language === 'Arabic' 
                                    ? 'يفضل استخدام 12 مشهد أو أقل للحصول على أفضل أداء' 
                                    : 'Recommended maximum is 12 scenes for best performance'}
                            </span>
                        </div>
                    )}
                    </div>
                </div>

                {/* Orientation */}
                <div className="flex gap-3">
                  <button
                    onClick={() => !isLoading && handleChange('aspectRatio', '9:16')}
                    disabled={isLoading}
                    className={`flex-1 bg-white text-gray-900 rounded-xl py-3 text-center cursor-pointer font-bold transition-all text-sm ${
                      params.aspectRatio === '9:16'
                        ? '!bg-sky-400 !text-white shadow-lg ring-2 ring-white/30'
                        : 'hover:bg-gray-100 opacity-90 hover:opacity-100'
                    } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {txt.mobile}
                  </button>
                  <button
                    onClick={() => !isLoading && handleChange('aspectRatio', '16:9')}
                    disabled={isLoading}
                    className={`flex-1 bg-white text-gray-900 rounded-xl py-3 text-center cursor-pointer font-bold transition-all text-sm ${
                      params.aspectRatio === '16:9'
                        ? '!bg-sky-400 !text-white shadow-lg ring-2 ring-white/30'
                        : 'hover:bg-gray-100 opacity-90 hover:opacity-100'
                    } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {txt.bigScreen}
                  </button>
                </div>

            </div>
          </div>

        </div>

        {/* SAWAN AI – ART STYLE NAMES ONLY + LOCALIZATION & COLORS */}
        <div className="space-y-4 relative">
            <label className="flex items-center text-gray-700 dark:text-gray-200 font-bold font-heading text-lg">
              <Palette className="w-5 h-5 me-2 text-pink-500" />
              {txt.artStyle}
              <HelpTooltip text={txt.help.artStyle} isArabic={isArabic} />
            </label>
            
            <div className={`relative`}>
                {/* Simple Grid of Art Styles (Images Removed) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {ART_STYLE_OPTIONS.map((style) => {
                        const isSelected = params.artStyle === style.label;
                        const displayName = params.language === 'Arabic' && style.labelAr ? style.labelAr : style.label;
                        
                        return (
                        <div 
                            key={style.id}
                            onClick={() => !isLoading && handleChange('artStyle', style.label)}
                            style={isSelected ? {
                                borderColor: style.color,
                                boxShadow: `0 0 0 2px ${style.color}33`,
                                backgroundColor: `${style.color}10`
                            } : {}}
                            className={`
                                cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-2 min-h-[60px]
                                ${isSelected 
                                    ? 'transform scale-105' 
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
                                }
                                ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
                            `}
                        >
                            <span className="font-bold text-sm md:text-base text-slate-700 dark:text-slate-200 leading-tight">
                                {displayName}
                            </span>
                            <div 
                                className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                                style={{
                                    borderColor: isSelected ? style.color : 'currentColor',
                                    color: isSelected ? style.color : '#cbd5e1'
                                }}
                            >
                                {isSelected && (
                                    <div 
                                        className="w-2 h-2 rounded-full" 
                                        style={{ backgroundColor: style.color }}
                                    />
                                )}
                            </div>
                        </div>
                    )})}
                </div>
            </div>
        </div>

        {/* Action Button or Generation Box */}
        <div className="pt-4">
            
            {!isLoading ? (
                <button
                    onClick={onSubmit}
                    disabled={!params.idea.trim() || isTooShort}
                    className={`w-full py-6 rounded-2xl text-2xl font-heading font-bold text-white shadow-xl transition-all transform hover:-translate-y-1 ${
                        !params.idea.trim() || isTooShort
                        ? 'bg-gray-300 dark:bg-slate-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:shadow-2xl hover:scale-[1.01]'
                    }`}
                >
                    {txt.createBtn}
                </button>
            ) : (
                <div className="w-full bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-bold font-heading">{txt.generatingTitle}</span>
                        <span className="text-brand-300 font-mono font-bold">{progress}%</span>
                    </div>
                    
                    {/* Progress Bar Container */}
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-3 border border-slate-700">
                        <div 
                            style={{ width: `${progress}%` }} 
                            className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300 ease-out"
                        />
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-4 animate-pulse">{progressMessage}</p>

                    {/* Controls */}
                    <div className="flex justify-center gap-4">
                        {isPaused ? (
                            <button 
                                onClick={onResume}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-colors"
                            >
                                <Play className="w-4 h-4" fill="currentColor" />
                                {txt.resume}
                            </button>
                        ) : (
                            <button 
                                onClick={onPause}
                                className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors"
                            >
                                <Pause className="w-4 h-4" fill="currentColor" />
                                {txt.pause}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* NEW SHARE SECTION */}
        <div className="flex flex-col items-center pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 opacity-80">
                {params.language === 'Arabic' ? 'راسلني' : 'Contact Me'}
             </p>
             <div className="flex gap-2.5 items-center">
                <button 
                  onClick={() => window.open("https://www.facebook.com/ahmedswanofficial", "_blank")}
                  className="bg-[#1877f2] text-white px-3 py-2 rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm border-none cursor-pointer relative"
                >
                  Facebook
                </button>
                <button 
                  onClick={() => window.open("https://wa.me/201000150303?text=Hello%20I%20want%20to%20ask%20about%20Sawan%20Kids%20Story%20Studio", "_blank")}
                  className="bg-[#25d366] text-white px-3 py-2 rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm border-none cursor-pointer"
                >
                  {params.language === 'Arabic' ? 'واتساب' : 'WhatsApp'}
                </button>
                <button 
                  onClick={() => window.open("https://t.me/AhmedMSawan", "_blank")}
                  className="bg-[#229ed9] text-white px-3 py-2 rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm border-none cursor-pointer"
                >
                  Telegram
                </button>
             </div>
        </div>

      </div>
    </div>
  );
};

export default SetupForm;