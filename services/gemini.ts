import { GoogleGenAI, Type, Schema, GenerateContentRequest } from "@google/genai";
import { StoryData, StoryParams, AspectRatio, StoryPage } from "../types";
import { SYSTEM_INSTRUCTION, ART_STYLE_OPTIONS } from "../constants";

// Helper to get client with key
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// Safe wrapper with Timeout and Retry
const withTimeout = <T>(promise: Promise<T>, ms: number, fallback?: T): Promise<T> => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            if (fallback !== undefined) resolve(fallback);
            else reject(new Error(`Timeout after ${ms}ms`));
        }, ms);
        promise.then(
            res => { clearTimeout(timer); resolve(res); },
            err => { clearTimeout(timer); reject(err); }
        );
    });
};

const safeGenerateContent = async (ai: GoogleGenAI, request: GenerateContentRequest, maxRetries = 1, timeoutMs = 45000): Promise<any> => {
    let lastError = null;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await withTimeout(ai.models.generateContent(request), timeoutMs);
        } catch (e: any) {
            console.error(`Generation attempt ${i + 1} failed:`, e);
            lastError = e;
            if (i < maxRetries) {
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    }
    throw lastError || new Error("Generation failed after retries.");
};

const BATCH_SIZE = 20;

// Helper to expand art style name to full prompt if needed
export const getArtStylePrompt = (styleName: string): string => {
    const styleOption = ART_STYLE_OPTIONS.find(s => s.label === styleName);
    if (styleOption?.isReal) {
        return "Ultra photorealistic, real humans, cinematic lighting, natural skin texture, no cartoon, no illustration";
    }
    if (styleName === "Educational Line Cartoon") {
        return "simple flat line illustration, white background, clean black outlines, minimal flat colors, educational cartoon style, whiteboard illustration, no 3D, no shadows, no textures, simple characters, expressive faces, child-friendly, educational visual, vector-style drawing, no text, no watermark";
    }
    if (styleName === "Hand-Drawn Cartoon") {
        return "hand-drawn cartoon characters, simple human figures, thin black outline, slightly imperfect hand-drawn lines, minimal facial features, dot eyes and simple mouth, no background, educational explainer illustration style, looks drawn by a human illustrator, soft limited colors, simple clean shapes, NOT vector, NOT flat design. Negative prompt: vector, flat illustration, 3d, pixar, anime, realistic, photorealistic, clay, stop motion, smooth digital lines, gradients, glossy";
    }
    return `${styleName} illustration style, high quality, children friendly`;
};

export class StoryGenerator {
  private isPaused = false;
  private resumeResolver: (() => void) | null = null;
  private ai = getClient();

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    if (this.resumeResolver) {
      this.resumeResolver();
      this.resumeResolver = null;
    }
  }

  private async checkPause() {
    if (this.isPaused) {
      await new Promise<void>((resolve) => {
        this.resumeResolver = resolve;
      });
    }
  }

  public async generateImagesForStory(
      storyData: StoryData, 
      aspectRatio: AspectRatio, 
      artStyle: string, 
      onProgress: (progress: number, message: string) => void
  ) {
      if (!storyData || !storyData.pages) return storyData;
      
      const totalPages = storyData.pages.length;
      if (totalPages === 0) return storyData;

      onProgress(30, "Preparing to generate images...");

      const characterContext = `CHARACTERS ENFORCED: ${storyData.characters.map(c => 
             `${c.name} (${c.gender || 'character'}, ${c.age}): ${c.description}. MUST remain visually identical (same face, species, colors).`
           ).join(' | ')}.`;
      
      const stylePrompt = getArtStylePrompt(artStyle);

      // Generate in chunks of 3 to avoid extreme rate limits, but don't block
      const batchSize = 3;
      let completed = 0;

      for (let i = 0; i < totalPages; i += batchSize) {
          await this.checkPause();
          const batch = storyData.pages.slice(i, i + batchSize);
          
          await Promise.all(batch.map(async (page) => {
              try {
                  const fullPrompt = `Art Style: ${stylePrompt}. ${characterContext} Scene: ${page.image_prompt}`;
                  page.generatedImage = await generateIllustration(fullPrompt, aspectRatio);
                  page.imageError = false;
              } catch (e) {
                  console.error("Image generation failed for page", page.page, e);
                  page.imageError = true;
              } finally {
                  completed++;
                  const progress = 30 + Math.round((completed / totalPages) * 60); // 30% -> 90%
                  onProgress(progress, `Generating images... (${completed}/${totalPages})`);
              }
          }));
      }

      return storyData;
  }

  public async generate(
    params: StoryParams, 
    onProgress: (progress: number, message: string) => void
  ): Promise<StoryData> {
    const totalPages = params.pageCount;
    
    // 1. Initial Batch
    onProgress(15, "Designing characters and plot...");
    await this.checkPause();

    const initialPageCount = Math.min(totalPages, BATCH_SIZE);
    
    // Sawan Language & Dialect Logic
    const languageConfig = params.language === 'Arabic' 
      ? { language: "Arabic", dialect: params.dialect || "Egyptian Arabic" }
      : { language: "English", dialect: "Standard American English" };
    
    // Determine the style prompt part
    const expandedArtStyle = getArtStylePrompt(params.artStyle);

    // Strict prompt based on the user's setup requirements
    const prompt = `
      Create a children's story based on the following inputs:
      1. Story Idea: ${params.idea}
      2. Language & Dialect:
         - Write the story in ${languageConfig.language}.
         - Use ${languageConfig.dialect} naturally.
         - Avoid formal language (MSA) if a dialect is specified; use local expressions suitable for children.
      3. Age Group: ${params.ageGroup}
      4. Story Template / Theme: ${params.storyType}
      5. Length: ${initialPageCount} pages ${totalPages > BATCH_SIZE ? `(Part 1 of ${totalPages})` : ''}
      6. Art Style: ${expandedArtStyle}
      7. Generate 1-3 characters and stick to them strictly. Do not invent random new characters later.

      Follow all quality rules and strict JSON output format defined in the system instructions.
      Ensure you generate exactly ${initialPageCount} pages in this batch.
    `;

    const pageSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        page: { type: Type.INTEGER },
        text: { type: Type.STRING },
        image_prompt: { type: Type.STRING },
      },
      required: ["page", "text", "image_prompt"]
    };

    // Strict schema matching the user's "STRICT OUTPUT FORMAT"
    const initialSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        story_info: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            language: { type: Type.STRING },
            age_group: { type: Type.STRING },
            art_style: { type: Type.STRING },
          },
          required: ["title", "language", "age_group", "art_style"]
        },
        characters: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              personality: { type: Type.STRING },
              age: { type: Type.STRING },
              gender: { type: Type.STRING },
            },
            required: ["name", "description", "personality", "age", "gender"]
          }
        },
        pages: {
          type: Type.ARRAY,
          items: pageSchema
        }
      },
      required: ["story_info", "characters", "pages"]
    };

    let storyData: StoryData;
    onProgress(15, "Generating base story...");
    try {
      const response = await safeGenerateContent(this.ai, {
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: initialSchema
        }
      }, 1, 60000); // 60s timeout for full story batch

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedText);
      
      storyData = {
        ...parsed,
        story_info: {
          ...parsed.story_info,
          aspect_ratio: params.aspectRatio,
          art_style: params.artStyle,
          dialect: params.dialect, // Injected to persist dialect choice
        }
      };
      
    } catch (e: any) {
      console.error("Failed to parse story JSON, using fallback story", e);
      // FALLBACK STORY INSTEAD OF THROWING ERROR
      storyData = {
          story_info: {
              title: params.language === 'Arabic' ? "قصتي الممتعة" : "My Fun Story",
              language: params.language,
              age_group: params.ageGroup,
              art_style: params.artStyle,
              aspect_ratio: params.aspectRatio,
              dialect: params.dialect
          },
          characters: [{
              name: params.language === 'Arabic' ? "بطل القصة" : "Hero",
              description: "A brave and creative character",
              personality: "Brave",
              age: params.ageGroup,
              gender: "Boy"
          }],
          pages: []
      };
      
      const safePageCount = Math.min(initialPageCount, totalPages);
      for(let i=1; i<=safePageCount; i++) {
           storyData.pages.push({
               page: i,
               text: params.language === 'Arabic' 
                   ? `هذه هي الصفحة رقم ${i} من القصة. بطلنا مستعد لمغامرة جديدة!` 
                   : `This is page ${i} of the story. Our hero is ready for a new adventure!`,
               image_prompt: `A beautiful and magical scene for page ${i} showing a brave character starting an adventure, ${expandedArtStyle}`
           });
      }
    }

    // Update progress based on initial batch
    onProgress(30, `Story Generated (${initialPageCount} pages)...`);

    // 2. Subsequent Batches Loop
    if (totalPages > BATCH_SIZE) {
       let currentPage = storyData.pages.length + 1;
       
       while (currentPage <= totalPages) {
           await this.checkPause();
           
           // --- Chapter Logic (Every 50 pages) ---
           const generatedCount = storyData.pages.length;
           if (generatedCount > 0 && generatedCount % 50 === 0) {
               const chapterNum = (generatedCount / 50) + 1;
               
               const chapterPage: StoryPage = {
                   page: currentPage,
                   text: `Chapter ${chapterNum}`,
                   image_prompt: `A decorative title page for Chapter ${chapterNum} of the story "${storyData.story_info.title}". ${expandedArtStyle}, elegant, magical typography, detailed background elements matching the story theme.`
               };
               
               storyData.pages.push(chapterPage);
               currentPage++;
               
               onProgress(
                   15 + Math.round(((currentPage - 1) / totalPages) * 15), 
                   `Starting Chapter ${chapterNum}...`
               );

               // If adding the chapter page reached the total, stop here
               if (currentPage > totalPages) break;
           }
           // --------------------------------------

           const remaining = totalPages - currentPage + 1;
           const currentBatchSize = Math.min(remaining, BATCH_SIZE);
           const endPage = currentPage + currentBatchSize - 1;

           const continuationPrompt = `
             You are continuing a children's story.
             
             Story Context:
             - Title: ${storyData.story_info.title}
             - Established Characters: ${storyData.characters.map(c => `${c.name} (${c.gender || 'character'}, ${c.age}): ${c.description}`).join(' | ')}
             - Style: ${expandedArtStyle}
             - Language: ${languageConfig.language} (${languageConfig.dialect})
             - Last Page (${currentPage-1}): "${storyData.pages[storyData.pages.length - 1].text}"
             
             TASK: Generate pages ${currentPage} to ${endPage}.
             
             STRICT CONTINUITY RULES:
             1. Keep strict continuity in plot.
             2. DO NOT introduce new characters. Use ONLY the Established Characters listed above.
             3. Maintain EXACT appearance. If an animal is established, keep the exact species.
             4. Maintain the same art style descriptions for image prompts.
             5. Visually enforce identically established characters in every prompt.
             6. Continue using ${languageConfig.dialect} naturally.
             7. YOU MUST WRITE FULL NARRATIVE TEXT for each page (2-6 sentences). DO NOT return empty text or placeholders like "This is page X".
           `;
           
           try {
               const nextResponse = await safeGenerateContent(this.ai, {
                  model: 'gemini-3-flash-preview',
                  contents: continuationPrompt,
                  config: {
                      responseMimeType: 'application/json',
                      responseSchema: {
                          type: Type.OBJECT,
                          properties: {
                              pages: {
                                  type: Type.ARRAY,
                                  items: pageSchema
                              }
                          }
                      }
                  }
               }, 1, 45000); // 45s timeout per batch
               
               const nextText = nextResponse.text;
               if (nextText) {
                    const cleanedNextText = nextText.replace(/```json/g, '').replace(/```/g, '').trim();
                    const nextData = JSON.parse(cleanedNextText);
                    if (nextData.pages && Array.isArray(nextData.pages)) {
                        storyData.pages = [...storyData.pages, ...nextData.pages];
                    }
               }
           } catch (e) {
               console.error(`Failed to parse/generate batch ${currentPage}-${endPage}, skipping to continue flow`, e);
               // Fast forward skip loop to not freeze. We will fill dummy pages to maintain structural integrity.
               for(let i=currentPage; i<=endPage; i++) {
                   storyData.pages.push({
                       page: i,
                       text: storyData.story_info.language === 'Arabic' ? "متابعة القصة..." : "Continuing story...",
                       image_prompt: `A beautiful scene from ${storyData.story_info.title}`
                   });
               }
           }
           
           currentPage += currentBatchSize;
           const currentProgress = 15 + Math.round(((currentPage - 1) / totalPages) * 15);
           onProgress(currentProgress, `Story Generating... ${currentPage - 1} of ${totalPages}`);
       }
    }

    // Check and replace placeholders or empty text with fallback content
    const fallbackTextAr = "في يوم جميل، بدأ بطلنا مغامرة رائعة مليئة بالمفاجآت، وكان متحمسًا لاكتشاف ما ينتظره.";
    const fallbackTextEn = "One beautiful day, our hero began an exciting adventure full of surprises.";
    
    storyData.pages = storyData.pages.map(p => {
        let text = (p.text || '').trim();
        const lowerText = text.toLowerCase();
        const isArabic = storyData.story_info.language === 'Arabic';
        
        // Skip chapter titles
        if (lowerText.startsWith("chapter ") && text.length < 15) {
            return { ...p, text };
        }

        const isPlaceholder = lowerText.startsWith("this is page") || 
                              lowerText.startsWith("هذه هي الصفحة رقم") ||
                              lowerText.startsWith("متابعة القصة") ||
                              lowerText.startsWith("continuing story");

        if (!text || text.length < 10 || isPlaceholder) {
            text = isArabic ? fallbackTextAr : fallbackTextEn;
        }

        return { ...p, text };
    });

    onProgress(30, "Story generated... Proceeding to image generation");
    return storyData;
  }
}

export const generateIllustration = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  const ai = getClient();
  
  const parts: any[] = [{ text: prompt }];

  try {
      const response = await safeGenerateContent(ai, {
        model: 'gemini-2.5-flash-image',
        contents: { parts: parts },
        config: { imageConfig: { aspectRatio: aspectRatio } }
      }, 1, 30000); // 30s timeout

      const candidates = response.candidates;
      if (candidates?.[0]?.content?.parts) {
          for (const part of candidates[0].content.parts) {
              if (part.inlineData?.data) return part.inlineData.data;
          }
      }
      throw new Error("Empty image response.");
  } catch (err) {
      console.error("Image generation timeout/fail, returning fallback flag", err);
      throw err;
  }
};

export const regeneratePrompt = async (currentPrompt: string): Promise<string> => {
    const ai = getClient();
    try {
        const response = await safeGenerateContent(ai, {
            model: 'gemini-3-flash-preview',
            contents: `Rewrite the following image prompt to change the camera angle or composition slightly, while keeping the subject and style exactly the same. Original: "${currentPrompt}". Return ONLY the new prompt text.`,
        }, 1, 10000); // 10s timeout
        return response.text?.trim() || currentPrompt;
    } catch (error) {
        console.error("Failed to regenerate prompt", error);
        return currentPrompt;
    }
};

export const generateNameMeaning = async (name: string, language: 'English' | 'Arabic') => {
  const ai = getClient();
  const isAr = language === 'Arabic';
  
  const prompt = isAr 
    ? `اشرح معنى الاسم "${name}" لطفل عمره من 5 إلى 12 سنة.
       المطلوب: إخراج كائن JSON يحتوي على:
       - meaning: معنى الاسم بشكل لطيف
       - origin: أصل الاسم (عربي، فارسي، إلخ)
       - traits: 3 صفات إيجابية لحامل الاسم
       استخدم جمل قصيرة وبسيطة ولطيفة للأطفال.
       ممنوع ذكر أي معلومات دينية معقدة أو حساسة.`
    : `Explain the meaning of the name "${name}" for a child aged 5–12.
       Output a JSON object with:
       - meaning: Gentle meaning of the name
       - origin: Origin of the name
       - traits: 3 positive traits
       Use short, friendly, child-safe sentences.
       Do NOT include sensitive or religious content.`;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      meaning: { type: Type.STRING },
      origin: { type: Type.STRING },
      traits: { type: Type.STRING },
    },
    required: ["meaning", "origin", "traits"]
  };

  try {
      const response = await safeGenerateContent(ai, {
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
              responseMimeType: 'application/json',
              responseSchema: schema
          }
      }, 1, 15000);

      const text = response.text;
      if (!text) throw new Error("No response");
      return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (e) {
      console.error("Name Meaning Parse/Gen Error", e);
      return {
          meaning: isAr ? "اسم جميل ومميز" : "A beautiful and unique name",
          origin: isAr ? "غير معروف" : "Unknown",
          traits: isAr ? "لطيف، ذكي، محبوب" : "Kind, smart, loved"
      };
  }
};