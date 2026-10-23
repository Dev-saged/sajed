import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Download, Save, Wand2, Images, Share2, CheckCircle, Clock, Video, Copy, Facebook, Youtube, Send, Phone, Edit3, FileText, Package } from 'lucide-react';
import { StoryData, StoryPage, AspectRatio } from '../types';
import { generateIllustration, getArtStylePrompt } from '../services/gemini';
import { getValidShareUrl } from '../constants';
import JSZip from "jszip";
import saveAs from "file-saver";
import { generatePDFBlob } from '../services/pdf';

interface StoryBookProps {
  story: StoryData;
  onReset: () => void;
}

const StoryBook: React.FC<StoryBookProps> = ({ story, onReset }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pages, setPages] = useState<StoryPage[]>(story.pages);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [bookSize, setBookSize] = useState<'A4' | 'Square'>('Square');
  const [isExporting, setIsExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  const isRTL = story.story_info.language === 'Arabic';
  const currentPage = pages[currentPageIndex];
  
  // Use aspect ratio from story info, default to 16:9 if missing
  const aspectRatio: AspectRatio = (story.story_info.aspect_ratio as AspectRatio) || '16:9';
  const isVertical = aspectRatio === '9:16';

  // Check if all images are generated
  const allImagesReady = pages.every(p => p.generatedImage);
  
  // Auto-generate image for the current page if missing
  useEffect(() => {
    const generateForPage = async () => {
      if (!currentPage.generatedImage && !currentPage.isGeneratingImage && !currentPage.imageError) {
        
        // Mark as generating
        setPages(prev => prev.map((p, idx) => 
          idx === currentPageIndex ? { ...p, isGeneratingImage: true, imageError: false } : p
        ));

        try {
          // Construct a full prompt using character info for consistency
          const characterContext = `CHARACTERS ENFORCED: ${story.characters.map(c => 
                 `${c.name} (${c.gender || 'character'}, ${c.age}): ${c.description}. MUST remain visually identical (same face, species, colors).`
               ).join(' | ')}.`;
          
          const stylePrompt = getArtStylePrompt(story.story_info.art_style);
          const fullPrompt = `Art Style: ${stylePrompt}. ${characterContext} Scene: ${currentPage.image_prompt}`;
          
          const base64Image = await generateIllustration(fullPrompt, aspectRatio);

          setPages(prev => prev.map((p, idx) => 
            idx === currentPageIndex ? { ...p, generatedImage: base64Image, isGeneratingImage: false, imageError: false } : p
          ));

        } catch (error) {
          console.error("Failed to generate image", error);
          setPages(prev => prev.map((p, idx) => 
            idx === currentPageIndex ? { ...p, isGeneratingImage: false, imageError: true } : p
          ));
        }
      }
    };

    generateForPage();
  }, [currentPageIndex, currentPage.generatedImage, currentPage.isGeneratingImage, currentPage.imageError, currentPage.image_prompt, story.characters, story.story_info.art_style, aspectRatio]);

  const handleNext = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  const handlePromptChange = (newPrompt: string) => {
    setPages(prev => prev.map((p, idx) => 
      idx === currentPageIndex ? { ...p, image_prompt: newPrompt } : p
    ));
  };

  const handleRegenerateImage = async () => {
    if (isGeneratingImage) return;
    setIsGeneratingImage(true);
    
    // Clear current image and mark generating
    setPages(prev => prev.map((p, idx) => 
        idx === currentPageIndex ? { ...p, generatedImage: undefined, isGeneratingImage: true, imageError: false } : p
    ));

    try {
        // Use the CURRENT edited prompt from state (Manual Edit Mode)
        const currentPromptText = currentPage.image_prompt;

        // Step 2: Generate new image using the edited prompt
        const characterContext = `CHARACTERS ENFORCED: ${story.characters.map(c => 
                 `${c.name} (${c.gender || 'character'}, ${c.age}): ${c.description}. MUST remain visually identical (same face, species, colors).`
               ).join(' | ')}.`;
        
        const stylePrompt = getArtStylePrompt(story.story_info.art_style);
        const fullPrompt = `Art Style: ${stylePrompt}. ${characterContext} Scene: ${currentPromptText}`;

        const base64Image = await generateIllustration(fullPrompt, aspectRatio);

        setPages(prev => prev.map((p, idx) => 
            idx === currentPageIndex ? { ...p, generatedImage: base64Image, isGeneratingImage: false, imageError: false } : p
        ));

    } catch (e) {
        console.error("Regeneration failed", e);
        setPages(prev => prev.map((p, idx) => 
            idx === currentPageIndex ? { ...p, isGeneratingImage: false, imageError: true } : p
        ));
    } finally {
        setIsGeneratingImage(false);
    }
  };

  const handleSaveJSON = () => {
    const cleanPages = pages.map(({ isGeneratingImage, ...rest }) => rest);
    
    const storyData = {
      ...story,
      pages: cleanPages,
      savedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem("sawan_story", JSON.stringify(storyData));
      alert(isRTL ? "✅ تم حفظ القصة بنجاح!" : "✅ Story saved successfully!");
    } catch (e) {
      console.warn("LocalStorage quota exceeded or error, falling back to download", e);
      
      const jsonString = JSON.stringify(storyData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      saveAs(blob, `${story.story_info.title.replace(/\s+/g, "_") || "story"}.json`);
      
      alert(isRTL ? "القصة كبيرة جداً للحفظ في المتصفح. تم تنزيلها كملف بدلاً من ذلك." : "Story is too large for browser storage. Downloaded as file instead.");
    }
    setShowExportMenu(false);
  };

  const handleDownloadImages = async () => {
    const zip = new JSZip();
    const folder = zip.folder("story-images");
    
    let count = 0;
    pages.forEach((page, i) => {
        if (page.generatedImage) {
            folder?.file(`page-${i + 1}.jpg`, page.generatedImage, { base64: true });
            count++;
        }
    });

    if (count === 0) {
        alert("No images generated yet!");
        return;
    }

    try {
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${story.story_info.title || "story"}_images.zip`);
    } catch (e) {
        console.error("Zip generation failed", e);
    }
    setShowExportMenu(false);
  };

  const handleDownloadPDF = async () => {
      if (!allImagesReady) {
          alert(isRTL ? "يرجى الانتظار حتى تكتمل جميع الصور." : "Please wait until all images are generated.");
          return;
      }
      setIsExporting(true);
      try {
          const blob = await generatePDFBlob(story, pages, bookSize, isRTL, setExportMsg);
          saveAs(blob, `${story.story_info.title.replace(/\s+/g, "_") || "story"}_book.pdf`);
      } catch (e) {
          console.error("PDF generation failed", e);
          alert(isRTL ? "فشل إنشاء ملف PDF" : "Failed to generate PDF");
      } finally {
          setIsExporting(false);
          setExportMsg('');
      }
  };

  const handleDownloadPackage = async () => {
      if (!allImagesReady) {
          alert(isRTL ? "يرجى الانتظار حتى تكتمل جميع الصور." : "Please wait until all images are generated.");
          return;
      }
      setIsExporting(true);
      try {
          setExportMsg(isRTL ? "جارٍ تجهيز الملف الكامل..." : "Preparing full package...");
          const zip = new JSZip();
          const safeTitle = story.story_info.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'story';
          const rootFolder = zip.folder(safeTitle);
          if (!rootFolder) throw new Error("Could not create zip folder");

          // 1. JSON Data
          rootFolder.file("story.json", JSON.stringify({ ...story, pages }, null, 2));

          // 2. Text Version
          let txtContent = `${story.story_info.title}\n\n`;
          pages.forEach(p => {
              txtContent += `Page ${p.page}:\n${p.text}\n\n`;
          });
          rootFolder.file("story.txt", txtContent);

          // 3. Images Folder
          const imgFolder = rootFolder.folder("pages");
          pages.forEach((p, i) => {
              if (p.generatedImage) {
                  if (i === 0) {
                      rootFolder.file("cover.png", p.generatedImage, { base64: true });
                  }
                  imgFolder?.file(`page_${i + 1}.png`, p.generatedImage, { base64: true });
              }
          });

          // 4. PDF Book
          const pdfBlob = await generatePDFBlob(story, pages, bookSize, isRTL, setExportMsg);
          rootFolder.file("book.pdf", pdfBlob);

          // Generate ZIP
          setExportMsg(isRTL ? "يتم ضغط الملفات..." : "Compressing files...");
          const content = await zip.generateAsync({ type: "blob" });
          saveAs(content, `${safeTitle}_package.zip`);

      } catch (e) {
          console.error("Package generation failed", e);
          alert(isRTL ? "فشل تحميل الملف الكامل" : "Failed to generate full package");
      } finally {
          setIsExporting(false);
          setExportMsg('');
      }
  };

  /* ================= SAWAN EXTENSIONS LOGIC ================= */

  const copyAnimationPrompt = () => {
    const prompt = `
Animate the image with smooth cinematic motion.

Rules:
- NO music.
- NO dialogue or spoken words.
- Characters must NOT speak or lip-sync.

Allowed audio:
- Natural sound effects only.
- Light laughter is allowed.
- Soft crying or emotional breathing is allowed.
- Ambient environment sounds.

Animation:
- Subtle realistic body movement.
- Natural breathing.
- Gentle head and eye motion.
- Emotional expressions without speech.

Camera:
- Smooth cinematic movement.

Result:
- Silent characters.
- Emotional animation.
    `;
    navigator.clipboard.writeText(prompt.trim());
    alert(isRTL ? "✅ تم نسخ برومبت التحريك" : "✅ Animation prompt copied!");
  };

  const handleShareWhatsapp = () => {
    const text = encodeURIComponent(`${story.story_info.title}\n\n${currentPage.text}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://www.facebook.com/AhmedSawanOfficial/')}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0f172a] text-slate-100 font-sans transition-colors duration-300">
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0f172a] z-20 relative">
        <button onClick={onReset} className="flex items-center text-slate-400 hover:text-white transition-colors font-bold">
          {isRTL ? <ArrowRight className="w-5 h-5 ms-2" /> : <ArrowLeft className="w-5 h-5 me-2" />}
          {isRTL ? "الرئيسية" : "Home"}
        </button>
        <h1 className={`text-lg md:text-xl font-heading font-bold text-white truncate px-4 ${isRTL ? 'font-arabic' : ''}`} id="storyTitle">
          {story.story_info.title}
        </h1>
        
        {/* Actions Menu (Header) */}
        <div className="relative">
            <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center text-brand-400 hover:text-brand-300 transition-colors font-bold gap-2 px-3 py-2 rounded-lg hover:bg-slate-800"
            >
                <Share2 className="w-5 h-5" />
                <span className="hidden md:inline">{isRTL ? "تصدير" : "Export"}</span>
            </button>

            {/* Dropdown */}
            {showExportMenu && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                    <button onClick={handleSaveJSON} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 text-left rtl:text-right text-slate-200 transition-colors">
                        <Save className="w-4 h-4 text-green-400" />
                        <span>{isRTL ? "حفظ المشروع" : "Save Project (JSON)"}</span>
                    </button>
                    {/* PDF Export Removed */}
                    <button onClick={handleDownloadImages} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 text-left rtl:text-right text-slate-200 transition-colors border-t border-slate-700">
                        <Images className="w-4 h-4 text-blue-400" />
                        <span>{isRTL ? "تنزيل الصور" : "Download Images (ZIP)"}</span>
                    </button>
                </div>
            )}
        </div>
      </header>
      
      {/* Overlay to close menu */}
      {showExportMenu && (
          <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)}></div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        
        {/* Story Card */}
        <div className={`
          w-full bg-slate-900 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-800 relative shrink-0
          ${isVertical ? 'max-w-2xl min-h-[600px]' : 'max-w-7xl min-h-[500px]'}
        `}>
          
          {/* Text Side */}
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-center items-start overflow-y-auto z-10 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <div className="w-full flex flex-col justify-center">
                <span className="text-slate-700 font-heading font-bold text-6xl opacity-30 mb-4 select-none">
                    {currentPage.page}
                </span>
                <p className={`text-2xl md:text-3xl leading-relaxed text-slate-200 font-medium ${isRTL ? 'font-arabic' : 'font-heading'}`}>
                {currentPage.text}
                </p>
            </div>
          </div>

          {/* Image Side (Split into Image & Prompt Editor) */}
          <div className={`
            bg-slate-950 flex flex-col
            ${isVertical ? 'flex-1 h-[650px] md:h-auto md:w-1/2 order-first md:order-last border-b md:border-b-0 md:border-l border-slate-800' : 'flex-1 h-[500px] md:h-auto border-t md:border-t-0 md:border-l rtl:md:border-l-0 rtl:md:border-r border-slate-800'}
          `}>
                <>
                    {/* Image View Area */}
                    <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden min-h-[200px]">
                        {currentPage.generatedImage ? (
                            <>
                                <img 
                                    src={`data:image/jpeg;base64,${currentPage.generatedImage}`} 
                                    alt={currentPage.image_prompt}
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute top-3 right-3 rtl:left-3 rtl:right-auto">
                                    <a 
                                        href={`data:image/jpeg;base64,${currentPage.generatedImage}`} 
                                        download={`story_page_${currentPage.page}.jpg`}
                                        className="bg-black/50 hover:bg-black/70 backdrop-blur-sm p-2 rounded-full text-white transition-all flex items-center justify-center border border-white/10"
                                        title="Download Image"
                                    >
                                        <Download className="w-5 h-5" />
                                    </a>
                                </div>
                            </>
                        ) : currentPage.imageError ? (
                            <div className="flex flex-col items-center p-8 text-center bg-red-900/10 w-full h-full justify-center">
                                <span className="text-4xl mb-4">⚠️</span>
                                <p className="text-red-400 font-heading text-lg font-bold">
                                    {isRTL ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong. Please try again."}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center p-8 text-center animate-pulse">
                                <Wand2 className="w-12 h-12 text-brand-500 mb-3 animate-bounce" />
                                <p className="text-slate-300 font-heading text-sm">
                                    {isRTL ? "جارٍ رسم المشهد..." : "Painting this page..."}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Prompt Editor Area */}
                    <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <Edit3 className="w-3 h-3" />
                            <label className="text-xs font-bold uppercase tracking-wider">
                                {isRTL ? "وصف الصورة (قابل للتعديل)" : "Image Prompt (Editable)"}
                            </label>
                        </div>
                        <textarea
                            value={currentPage.image_prompt}
                            onChange={(e) => handlePromptChange(e.target.value)}
                            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs md:text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none h-20 md:h-24 transition-all placeholder-slate-500"
                            placeholder={isRTL ? "اكتب وصف الصورة هنا..." : "Enter image description here..."}
                            dir="ltr" 
                        />
                        <button
                            onClick={handleRegenerateImage}
                            disabled={currentPage.isGeneratingImage}
                            className={`mt-3 w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                                currentPage.isGeneratingImage 
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-500 hover:to-sky-500 text-white hover:shadow-lg active:scale-[0.98]'
                            }`}
                        >
                            <RefreshCw className={`w-4 h-4 ${currentPage.isGeneratingImage ? 'animate-spin' : ''}`} />
                            {isRTL ? "إعادة توليد الصورة" : "Regenerate Image"}
                        </button>
                    </div>
                </>
          </div>
        </div>

        {/* Story Actions (Enhanced Export) */}
        <div className="mt-8 w-full max-w-4xl animate-fade-in bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl" id="storyActions">
            <div className="flex flex-col items-center justify-center gap-6">
                
                <div className="text-center">
                    <p className={`text-base font-bold flex items-center justify-center gap-2 ${allImagesReady ? 'text-green-400' : 'text-slate-400'}`} id="storyNotice">
                       {allImagesReady ? (
                           <>
                               <CheckCircle className="w-5 h-5" />
                               {isRTL ? "✅ القصة جاهزة! يمكنك الآن حفظ وتحميل كتابك." : "✅ The story is ready! You can now save and download your book."}
                           </>
                       ) : (
                           <>
                               <Clock className="w-5 h-5 animate-pulse" />
                               {isRTL 
                                 ? "⏳ سيتم تفعيل خيارات التصدير للكتب بعد توليد جميع الصور..." 
                                 : "⏳ Book download options will be ready after all images are generated..."}
                           </>
                       )}
                    </p>
                    {isExporting && exportMsg && (
                        <p className="mt-2 text-sky-400 font-bold text-sm animate-pulse">{exportMsg}</p>
                    )}
                </div>

                <div className="w-full max-w-md flex flex-col gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <h3 className="text-center font-bold text-slate-300">
                        {isRTL ? "حجم الكتاب:" : "Book Size:"}
                    </h3>
                    <div className="flex justify-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="bookSize" 
                                value="A4" 
                                checked={bookSize === 'A4'}
                                onChange={() => setBookSize('A4')}
                                className="accent-brand-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="font-bold text-slate-200">A4</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="bookSize" 
                                value="Square" 
                                checked={bookSize === 'Square'}
                                onChange={() => setBookSize('Square')}
                                className="accent-brand-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="font-bold text-slate-200">{isRTL ? "مربع (كتب أطفال)" : "Square (Kids Book)"}</span>
                        </label>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center w-full">
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={!allImagesReady || isExporting}
                        className="px-6 py-4 flex-1 sm:flex-auto rounded-xl border-none cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
                    >
                        <FileText className="w-6 h-6" />
                        {isRTL ? "📘 تحميل الكتاب الكامل" : "📘 Download Full Book"}
                    </button>

                    <button 
                        onClick={handleDownloadPackage}
                        disabled={!allImagesReady || isExporting}
                        className="px-6 py-4 flex-1 sm:flex-auto rounded-xl border-none cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
                    >
                        <Package className="w-6 h-6" />
                        {isRTL ? "تحميل الملف الكامل" : "Download Full Package"}
                    </button>
                    
                    <button 
                        onClick={handleSaveJSON}
                        disabled={isExporting}
                        className="px-4 py-4 rounded-xl border-none cursor-pointer bg-slate-700 text-white font-bold hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 shadow hover:shadow-slate-600/30 disabled:opacity-50"
                        title={isRTL ? "حفظ كـ JSON" : "Save as JSON"}
                    >
                        <Save className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>

        {/* SAWAN STUDIO EXTENSIONS */}
        <div className="mt-8 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 🎬 Animation Prompt */}
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 flex flex-col gap-3">
             <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
                <Video className="w-5 h-5" />
                <h3>{isRTL ? "تحريك الصورة" : "Animate Image"}</h3>
             </div>
             <p className="text-xs text-slate-400">{isRTL ? "نسخ وصف جاهز لتحريك الصورة في أدوات الفيديو" : "Copy prompt for video generation tools"}</p>
             <button 
               onClick={copyAnimationPrompt}
               className="mt-auto w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm"
             >
               <Copy className="w-4 h-4" />
               {isRTL ? "نسخ البرومبت" : "Copy Prompt"}
             </button>
          </div>

          {/* 🔗 Share */}
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 flex flex-col gap-3">
             <div className="flex items-center gap-2 text-green-400 font-bold mb-1">
                <Share2 className="w-5 h-5" />
                <h3>{isRTL ? "مشاركة القصة" : "Share Story"}</h3>
             </div>
             <p className="text-xs text-slate-400">{isRTL ? "شارك نص الصفحة الحالية" : "Share current page text"}</p>
             <div className="flex gap-2 mt-auto">
                <button 
                  onClick={handleShareWhatsapp}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </button>
                <button 
                  onClick={handleShareFacebook}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <Facebook className="w-4 h-4" />
                  FB
                </button>
             </div>
          </div>

        </div>

        {/* SAWAN SOCIAL FOOTER */}
        <div className="mt-12 mb-8 flex flex-col items-center justify-center gap-6">
           {/* Share App Widget */}
           <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${getValidShareUrl()}`, "_blank", "width=600,height=500")} className="bg-[#1877f2] hover:bg-[#1877f2]/90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg hover:scale-105 border-none cursor-pointer">Facebook</button>
              <button onClick={() => window.open(`https://api.whatsapp.com/send?text=${getValidShareUrl()}`, "_blank")} className="bg-[#25d366] hover:bg-[#25d366]/90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg hover:scale-105 border-none cursor-pointer">WhatsApp</button>
              <button onClick={() => window.open(`https://t.me/share/url?url=${getValidShareUrl()}`, "_blank")} className="bg-[#229ed9] hover:bg-[#229ed9]/90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg hover:scale-105 border-none cursor-pointer">Telegram</button>
           </div>
           
           {/* Follow Us Links */}
           <div className="flex items-center justify-center gap-6 opacity-60 hover:opacity-100 transition-opacity p-4 bg-slate-800/50 rounded-full">
                <a href="https://www.youtube.com/@SawanAiOfficial" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:scale-110 transition-transform text-red-500 hover:bg-slate-700">
                    <Youtube className="w-6 h-6" />
                </a>
                <a href="https://www.facebook.com/AhmedSawanOfficial/" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:scale-110 transition-transform text-blue-500 hover:bg-slate-700">
                    <Facebook className="w-6 h-6" />
                </a>
                <a href="https://t.me/AhmedMSawan" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:scale-110 transition-transform text-sky-500 hover:bg-slate-700">
                    <Send className="w-6 h-6" />
                </a>
                <a href="https://api.whatsapp.com/send/?phone=201000150303" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:scale-110 transition-transform text-green-500 hover:bg-slate-700">
                    <Phone className="w-6 h-6" />
                </a>
           </div>
        </div>

      </main>

      {/* Footer Navigation */}
      <footer className="p-6 border-t border-slate-800 bg-[#0f172a] flex items-center justify-between z-20">
        <button 
            onClick={handlePrev} 
            disabled={currentPageIndex === 0}
            className={`flex items-center px-6 py-3 rounded-xl font-bold font-heading transition-all ${
                currentPageIndex === 0 
                ? 'text-slate-700 cursor-not-allowed' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
        >
            {isRTL ? <ArrowRight className="w-5 h-5 ms-2" /> : <ArrowLeft className="w-5 h-5 me-2" />}
            {isRTL ? "السابق" : "Previous"}
        </button>

        <div className="hidden md:flex gap-2">
            {pages.map((_, idx) => (
                <div 
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === currentPageIndex ? 'bg-brand-500 scale-125' : 'bg-slate-700'
                    }`}
                />
            ))}
        </div>
        <div className="md:hidden text-slate-500 font-bold">
            {currentPageIndex + 1} / {pages.length}
        </div>

        <button 
            onClick={handleNext} 
            disabled={currentPageIndex === pages.length - 1}
            className={`flex items-center px-6 py-3 rounded-xl font-bold font-heading transition-all ${
                currentPageIndex === pages.length - 1 
                ? 'text-slate-700 cursor-not-allowed' 
                : 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-900/20'
            }`}
        >
            {isRTL ? "التالي" : "Next"}
            {isRTL ? <ArrowLeft className="w-5 h-5 me-2" /> : <ArrowRight className="w-5 h-5 ms-2" />}
        </button>
      </footer>
    </div>
  );
};

export default StoryBook;