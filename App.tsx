import React, { useState, useEffect, useRef } from 'react';
import { StoryParams, StoryState } from './types';
import { INITIAL_STORY_PARAMS } from './constants';
import { StoryGenerator } from './services/gemini';
import SetupForm from './components/SetupForm';
import StoryBook from './components/StoryBook';
import { GamesDashboard } from './components/GamesDashboard';
import { ReadAndLearn } from './components/ReadAndLearn';
import { NameMeaning } from './components/NameMeaning';
import { Gamepad2, BookOpen, Sparkles } from 'lucide-react';

// Apply Language Helper - Defined outside to run immediately
const applyLanguage = (langCode: string) => {
  const html = document.documentElement;
  
  // Persist choice
  localStorage.setItem("uiLang", langCode);

  if (langCode === "ar") {
    html.setAttribute("lang", "ar");
    html.setAttribute("dir", "rtl");
    html.classList.add("rtl");
  } else {
    html.setAttribute("lang", "en");
    html.setAttribute("dir", "ltr");
    html.classList.remove("rtl");
  }
};

// Run immediately to set initial document state before React renders
const savedUiLang = localStorage.getItem("uiLang") || "en";
applyLanguage(savedUiLang);

const App: React.FC = () => {
  const [state, setState] = useState<StoryState>({
    step: 'setup',
    params: {
      ...INITIAL_STORY_PARAMS,
      // Initialize state language based on persisted value to match DOM
      language: (localStorage.getItem("uiLang") === 'ar' ? 'Arabic' : 'English')
    },
    data: null,
    error: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // View State (Story vs Games vs Read & Learn vs Names)
  const [currentView, setCurrentView] = useState<'story' | 'games' | 'learn' | 'names'>('story');
  
  // Generation Control State
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("Starting...");
  const [isPaused, setIsPaused] = useState(false);
  
  // Use a ref for the generator so it persists across renders
  const generatorRef = useRef<StoryGenerator>(new StoryGenerator());

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
      setIsDarkMode(savedTheme === 'dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute("data-theme", 'dark');
      setIsDarkMode(true);
    }
  }, []);

  // Sync Language with DOM when state changes
  useEffect(() => {
    const lang = state.params.language;
    const langCode = lang === 'Arabic' ? 'ar' : 'en';
    applyLanguage(langCode);
  }, [state.params.language]);

  // Global click listener for empty links (Universal Share Fix requirement)
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const a = target.closest("a");
      if(a){
        const href = a.getAttribute("href");
        // Prevent default if href is missing, empty, or just a hash
        if(!href || href === "#" || href === ""){
          e.preventDefault();
        }
      }
    };
    document.addEventListener("click", handleLinkClick);
    return () => document.removeEventListener("click", handleLinkClick);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setIsDarkMode(!isDarkMode);
  };

  const toggleLanguage = () => {
    const currentLang = state.params.language;
    const newLang = currentLang === 'English' ? 'Arabic' : 'English';
    
    setState(prev => ({
        ...prev,
        params: { ...prev.params, language: newLang }
    }));
  };

  const handleParamsChange = (newParams: StoryParams) => {
    setState(prev => ({ ...prev, params: newParams }));
  };

  const handleCreateStory = async () => {
    setIsLoading(true);
    setState(prev => ({ ...prev, error: null }));
    setProgress(0);
    setProgressMessage(state.params.language === 'Arabic' ? "جاري التحضير..." : "Preparing...");
    setIsPaused(false);
    
    // Ensure generator is reset/ready
    generatorRef.current.resume();

    try {
      // Step 1: Generate Story (15% -> 30%)
      const storyData = await generatorRef.current.generate(
        state.params, 
        (prog, msg) => {
          setProgress(prog);
          setProgressMessage(msg);
        }
      );
      
      if (!storyData || !storyData.pages || storyData.pages.length === 0) {
         throw new Error("Received empty or invalid story data from generator.");
      }

      // Step 2: Generate Images (30% -> 90%)
      const finalStoryData = await generatorRef.current.generateImagesForStory(
          storyData,
          state.params.aspectRatio,
          state.params.artStyle,
          (prog, msg) => {
              setProgress(prog);
              setProgressMessage(msg);
          }
      );

      // Step 3: Finalize (90% -> 100%)
      setProgress(100);
      setProgressMessage(state.params.language === 'Arabic' ? "تجهيز الكتاب للطباعة والقراءة..." : "Finalizing book for reading...");

      // Short delay for UI progress to visually hit 100%
      await new Promise(res => setTimeout(res, 800));

      setState(prev => ({
        ...prev,
        step: 'reading',
        data: finalStoryData
      }));
    } catch (error: any) {
      console.error(error);
      setState(prev => ({
        ...prev,
        error: prev.params.language === 'Arabic' ? "حدث خطأ أثناء إنشاء القصة" : "Error generating story"
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    generatorRef.current.pause();
  };

  const handleResume = () => {
    setIsPaused(false);
    generatorRef.current.resume();
  };

  const handleLoadStory = () => {
    const savedData = localStorage.getItem("sawan_story");
    const isArabic = state.params.language === 'Arabic';

    const loadFromFile = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target?.result as string);
            // Basic validation to ensure it looks like a story
            if (json.story_info && json.pages) {
                setState(prev => ({
                    ...prev,
                    step: 'reading',
                    data: json
                }));
            } else {
                throw new Error("Invalid story format");
            }
          } catch (err) {
            alert(isArabic ? "ملف غير صالح." : "Invalid story file.");
          }
        };
        reader.readAsText(file);
      };
      input.click();
    };

    if (savedData) {
      const message = isArabic 
        ? "وجدنا قصة محفوظة في المتصفح. هل تريد استكمالها؟\n\nاضغط 'موافق' للتحميل.\nاضغط 'إلغاء' لرفع ملف قصة من جهازك."
        : "Found a saved story in browser storage. Do you want to load it?\n\nClick 'OK' to load saved story.\nClick 'Cancel' to upload a file from your device.";
      
      if (window.confirm(message)) {
        try {
          const story = JSON.parse(savedData);
          setState(prev => ({
            ...prev,
            step: 'reading',
            data: story
          }));
        } catch (e) {
           console.error("Failed to load local story", e);
           loadFromFile();
        }
      } else {
        loadFromFile();
      }
    } else {
      loadFromFile();
    }
  };

  const handleReset = () => {
    setState({
      step: 'setup',
      params: {
        ...INITIAL_STORY_PARAMS,
        // Preserve current language selection on reset
        language: state.params.language
      },
      data: null,
      error: null
    });
  };

  return (
    <div id="app-root" className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      {/* Global Header Controls */}
      <div className="top-actions pointer-events-auto">
        {/* Name Meaning Toggle Button */}
        <button
            onClick={() => setCurrentView(currentView === 'names' ? 'story' : 'names')}
            className={`flex items-center gap-2 font-extrabold px-4 py-2 rounded-2xl transition-all shadow-lg active:scale-95 ${
                currentView === 'names' 
                ? 'bg-gradient-to-r from-sky-500 to-green-500 text-white scale-105 shadow-sky-500/30 ring-2 ring-white/20' 
                : 'bg-sky-500 hover:bg-sky-400 text-white hover:shadow-sky-500/20'
            }`}
            title={state.params.language === 'English' ? 'Name Meaning' : 'معنى اسمك'}
        >
            <Sparkles className="w-5 h-5" />
            <span className="hidden sm:inline">{state.params.language === 'English' ? 'Name Meaning' : 'معنى اسمك'}</span>
        </button>

        {/* Games Toggle Button */}
        <button
            onClick={() => setCurrentView(currentView === 'games' ? 'story' : 'games')}
            className={`flex items-center gap-2 font-extrabold px-4 py-2 rounded-2xl transition-all shadow-lg active:scale-95 ${
                currentView === 'games' 
                ? 'bg-amber-600 text-white scale-105 shadow-amber-500/30 ring-2 ring-white/20' 
                : 'bg-amber-500 hover:bg-amber-400 text-slate-900 hover:shadow-amber-500/20'
            }`}
            title={state.params.language === 'English' ? 'Educational Games' : 'الألعاب التعليمية'}
        >
            <Gamepad2 className="w-5 h-5" />
            <span className="hidden sm:inline">{state.params.language === 'English' ? 'Games' : 'ألعاب'}</span>
        </button>

        {/* Read & Learn Toggle Button */}
        <button
            onClick={() => setCurrentView(currentView === 'learn' ? 'story' : 'learn')}
            className={`flex items-center gap-2 font-extrabold px-4 py-2 rounded-2xl transition-all shadow-lg active:scale-95 ${
                currentView === 'learn' 
                ? 'bg-emerald-600 text-white scale-105 shadow-emerald-500/30 ring-2 ring-white/20' 
                : 'bg-yellow-400 hover:bg-yellow-300 text-black hover:shadow-yellow-500/20'
            }`}
            title={state.params.language === 'English' ? 'Read & Learn' : 'اقرأ وتعلّم'}
        >
            <BookOpen className="w-5 h-5" />
            <span className="hidden sm:inline">{state.params.language === 'English' ? 'Read & Learn' : 'اقرأ وتعلّم'}</span>
        </button>

        <button 
          id="themeToggle" 
          type="button"
          onClick={toggleTheme} 
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        <button 
          id="langToggle" 
          type="button"
          onClick={toggleLanguage}
          title={state.params.language === 'English' ? "العربية" : "English"}
        >
          {/* Flag represents the TARGET language to switch to, or current status indicator */}
          <img 
            src={state.params.language === 'English' ? "https://flagcdn.com/w40/eg.png" : "https://flagcdn.com/w40/us.png"} 
            alt={state.params.language === 'English' ? "Arabic" : "English"} 
          />
        </button>
      </div>

      {currentView === 'games' ? (
          <GamesDashboard 
            language={state.params.language} 
            onBack={() => setCurrentView('story')} 
          />
      ) : currentView === 'learn' ? (
          <ReadAndLearn 
             language={state.params.language}
             onBack={() => setCurrentView('story')}
          />
      ) : currentView === 'names' ? (
          <NameMeaning
             language={state.params.language}
             onBack={() => setCurrentView('story')}
          />
      ) : (
          <>
            {state.step === 'setup' && (
                <div className={`flex-1 flex flex-col items-center justify-center p-4 transition-opacity ${isLoading ? 'opacity-90 grayscale-[20%] pointer-events-none' : ''}`}>
                <SetupForm 
                    params={state.params} 
                    onChange={handleParamsChange} 
                    onSubmit={handleCreateStory}
                    onLoadStory={handleLoadStory}
                    isLoading={isLoading}
                    progress={progress}
                    progressMessage={progressMessage}
                    isPaused={isPaused}
                    onPause={handlePause}
                    onResume={handleResume}
                />
                </div>
            )}

            <div id="story-output" className="flex flex-col flex-1 items-center">
              {state.error && (
                  <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800 pointer-events-auto">
                    {state.error}
                  </div>
              )}
              {state.step === 'reading' && state.data && (
                  <StoryBook story={state.data} onReset={handleReset} />
              )}
              {state.step === 'reading' && !state.data && (
                  <div className="flex-1 flex items-center justify-center p-8 text-center text-red-500 font-bold text-xl">
                    {state.params.language === 'Arabic' ? "حدث خطأ أثناء إنشاء القصة" : "Error generating story"}
                  </div>
              )}
            </div>
          </>
      )}
    </div>
  );
};

export default App;