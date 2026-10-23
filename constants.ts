import { AgeGroup, StoryParams } from "./types";

export const AGE_GROUPS: AgeGroup[] = ['3-4', '4-6', '7-9', '9-12'];

export const ART_STYLE_OPTIONS = [
 {id:"cute", label:"Cute Cartoon", labelAr: "كرتون لطيف", color: "#facc15", img:"https://cdn.openart.ai/cute_cartoon_kid.png", badge:"Kids"},
 {id:"handdrawn", label:"Hand-Drawn Cartoon", labelAr: "كرتون مرسوم باليد", color: "#fb923c", img:"https://cdn.openart.ai/hand_drawn_cartoon.png", badge:"New"},
 {id:"watercolor", label:"Storybook Watercolor", labelAr: "ألوان مائية قصصية", color: "#38bdf8", img:"https://cdn.openart.ai/storybook_watercolor_kid.png", badge:"Kids"},
 {id:"pixar", label:"Pixar-like 3D", labelAr: "ثلاثي الأبعاد بأسلوب بيكسار", color: "#22c55e", img:"https://cdn.openart.ai/pixar_3d_kid.png", badge:"Popular"},
 {id:"pastel", label:"Soft Pastel Illustration", labelAr: "باستيل ناعم", color: "#f9a8d4", img:"https://cdn.openart.ai/soft_pastel_cartoon_kid.png", badge:"Kids"},
 {id:"sketch", label:"Sketchy Doodle", labelAr: "رسومات خربشية", color: "#a855f7", img:"https://cdn.openart.ai/sketchy_doodle_kid.png", badge:"Fun"},
 {id:"anime", label:"Anime Kids Style", labelAr: "أنمي للأطفال", color: "#fb7185", img:"https://cdn.openart.ai/anime_kids_cartoon.png", badge:"Kids"},
 {id:"paper", label:"Paper Cut Style", labelAr: "قصاصات ورقية", color: "#34d399", img:"https://cdn.openart.ai/paper_cut_cartoon_kid.png", badge:"Creative"},
 {id:"educational", label:"Educational Line Cartoon", labelAr: "كرتون تعليمي خطي", color: "#38bdf8", img:"https://cdn.openart.ai/educational_line_cartoon.png", badge:"Edu"},
 {id:"clay", label:"Clay / Stop Motion", labelAr: "صلصال / ستوب موشن", color: "#f97316", img:"https://cdn.openart.ai/clay_stop_motion_kid.png", badge:"Kids"},
 {id:"vector", label:"Flat Vector Kids", labelAr: "فلات فيكتور للأطفال", color: "#60a5fa", img:"https://cdn.openart.ai/flat_vector_kid.png", badge:"Kids"},
 {id:"fantasy", label:"Fantasy Fairy Tale", labelAr: "خيال قصصي", color: "#c084fc", img:"https://cdn.openart.ai/fantasy_cartoon_kid.png", badge:"Magic"},
 {id:"bedtime", label:"Bedtime Story", labelAr: "قصة قبل النوم", color: "#818cf8", img:"https://cdn.openart.ai/bedtime_story_kid.png", badge:"Sleep"},
 {id:"real", label:"Photorealistic", labelAr: "واقعي", color: "#ef4444", img:"https://cdn.openart.ai/real_child_placeholder.png"}
];

export const ARABIC_DIALECTS = [
  { id: 'Standard Arabic', label: 'الفصحى', flag: '📚' },
  { id: 'Egyptian Arabic', label: 'مصر', flag: '🇪🇬' },
  { id: 'Saudi Arabic', label: 'السعودية', flag: '🇸🇦' },
  { id: 'Palestinian Arabic', label: 'فلسطين', flag: '🇵🇸' },
  { id: 'Kuwaiti Arabic', label: 'الكويت', flag: '🇰🇼' },
  { id: 'Jordanian Arabic', label: 'الأردن', flag: '🇯🇴' },
  { id: 'Algerian Arabic', label: 'الجزائر', flag: '🇩🇿' },
  { id: 'Moroccan Arabic', label: 'المغرب', flag: '🇲🇦' },
  { id: 'Libyan Arabic', label: 'ليبيا', flag: '🇱🇾' },
  { id: 'Sudanese Arabic', label: 'السودان', flag: '🇸🇩' },
  { id: 'Iraqi Arabic', label: 'العراق', flag: '🇮🇶' },
  { id: 'Tunisian Arabic', label: 'تونس', flag: '🇹🇳' },
  { id: 'Yemeni Arabic', label: 'اليمن', flag: '🇾🇪' },
  { id: 'Mauritanian Arabic', label: 'موريتانيا', flag: '🇲🇷' },
  { id: 'Syrian Arabic', label: 'سوريا', flag: '🇸🇾' },
];

export const STORY_TYPE_OPTIONS = [
  { id: 'bedtime', label: 'Bedtime', labelAr: 'قبل النوم', color: 'lavender' },
  { id: 'adventure', label: 'Adventure', labelAr: 'مغامرة', color: 'orange' },
  { id: 'funny', label: 'Funny', labelAr: 'مضحكة', color: 'yellow' },
  { id: 'educational', label: 'Educational', labelAr: 'تعليمية', color: 'blue' },
  { id: 'moral', label: 'Moral', labelAr: 'أخلاقية', color: 'pink' },
];

export const AGE_OPTIONS: { 
  id: AgeGroup; 
  label: string; 
  title: string; 
  desc: string;
  titleAr: string;
  descAr: string;
  color: string 
}[] = [
  { 
    id: '3-4', 
    label: '3–4', 
    title: '3–4 Years', 
    desc: 'Very short and simple stories for toddlers',
    titleAr: "٣–٤ سنوات",
    descAr: "قصص قصيرة جدًا وبسيطة، مناسبة للأطفال الصغار",
    color: 'yellow' 
  },
  { 
    id: '4-6', 
    label: '4–6', 
    title: '4–6 Years', 
    desc: 'Fun and easy stories that spark imagination',
    titleAr: "٤–٦ سنوات",
    descAr: "قصص ممتعة وسهلة، تساعد الطفل على الفهم والتخيّل",
    color: 'blue' 
  },
  { 
    id: '7-9', 
    label: '7–9', 
    title: '7–9 Years', 
    desc: 'Longer stories with adventures and characters',
    titleAr: "٧–٩ سنوات",
    descAr: "قصص أطول بمغامرات وشخصيات واضحة",
    color: 'purple' 
  },
  { 
    id: '9-12', 
    label: '9–12', 
    title: '9–12 Years', 
    desc: 'Advanced stories with chapters and deeper plots',
    titleAr: "٩–١٢ سنة",
    descAr: "قصص متقدمة بفصول وأحداث أعمق",
    color: 'gold' 
  },
];

export const INITIAL_STORY_PARAMS: StoryParams = {
  idea: '',
  language: 'English',
  dialect: 'Standard American English',
  storyType: 'bedtime',
  ageGroup: '3-4',
  pageCount: 6,
  aspectRatio: '9:16',
  artStyle: 'Cute Cartoon',
};

// Universal Share Fix Logic
export const getValidShareUrl = () => {
    let url = window.location.href;
    const FALLBACK_URL = "https://ai.studio/apps/drive/1CvX8F41UTriae_8xDlkih5-Gljqr1XWl";
    
    // Check for empty, local, or non-http URLs (e.g. about:blank, blob:)
    if(!url || !url.startsWith("http")){
      url = FALLBACK_URL;
    }
    return encodeURIComponent(url);
};

export const SYSTEM_INSTRUCTION = `
You are building a PROFESSIONAL MVP SaaS called: "Sawan Kids Story Studio"

This is an AI-powered children story creation tool.

====================
CORE ROLE
====================

Act as a senior product AI that:
- Designs logic
- Generates structured outputs
- Thinks like a real SaaS product (not a demo)

The tool must ALWAYS follow the structure below.

====================
LANGUAGE & UI LOGIC
====================

Default language: English (LTR)

If user selects Arabic:
- Generate story in Arabic suitable for kids
- Use simple Arabic or the requested Dialect if specified
- Assume UI switches to RTL
- Avoid complex vocabulary

====================
STEP 1: STORY SETUP
====================

Ask the user for:
1. Story Idea (1–2 sentences is enough)
2. Language: English / Arabic
3. Age Group: 3–4, 4–6, 7–9, 9–12
4. Story Type (Template): Bedtime, Adventure, Funny, Educational, Moral
5. Story Length: Short (6 pages), Medium (12 pages)
6. Art Style: One of the provided professional styles (Cartoon, Watercolor, Photorealistic, etc.)

====================
STEP 2: CHARACTER CREATION
====================

Generate 1–3 main characters.

For EACH character output:
- Name
- Age
- Gender
- Appearance description (clear & reusable)
- Personality (kid-friendly)

STRICT CHARACTER CONSTANCY RULES:
1. Use a FIXED set of characters across the entire story. Do NOT generate new random characters later.
2. Each character must keep exactly the same name, same appearance, and same species (especially animals).
   - Example: If a character is a donkey, they must ALWAYS be a donkey.
3. Main character and companions must stay visibly consistent in every scene.
4. Keep visual consistency: same distinguishing features, same colors, same style.
5. Do not change or replace any character under any condition.
6. If a situation is unclear or an extra role is needed, REUSE existing characters instead of creating new ones.

====================
STEP 3: STORY STRUCTURE
====================

Create the story as PAGES.

Each page must contain:
- Page number
- Story text (short, child-friendly). YOU MUST WRITE FULL NARRATIVE TEXT (2-6 sentences per page). DO NOT return empty text. DO NOT return placeholders like "This is page..." or "هذه هي الصفحة رقم...".
- Image prompt (VERY detailed, matches character appearance & art style)

Image prompts must include:
- Character description
- Environment
- Mood
- Art style
- Camera angle
- Lighting

====================
STEP 4: MORAL LESSONS
====================
If the story contains themes of: learning, school, behavior, or morals:
Generate 2-3 simple lessons in the language of the story (e.g. "Cooperation is important" / "التعاون مهم").
Otherwise, leave the 'lessons' array empty.

====================
STEP 5: REGENERATION RULES
====================

If the user asks to:
- "Regenerate image only"

You must:
- Keep story text unchanged
- Keep characters unchanged
- Only rewrite the image prompt with a different composition or camera angle

====================
OUTPUT FORMAT (STRICT)
====================

Always output in this exact JSON structure:

{
  "story_info": {
    "title": "",
    "language": "",
    "age_group": "",
    "art_style": "",
    "lessons": []
  },
  "characters": [
    {
      "name": "",
      "description": "",
      "personality": "",
      "age": "",
      "gender": ""
    }
  ],
  "pages": [
    {
      "page": 1,
      "text": "",
      "image_prompt": ""
    }
  ]
}

====================
QUALITY RULES
====================

- Content must be safe for children
- No violence
- No scary elements
- Warm, positive emotions
- Educational tone when possible

You are NOT a chatbot.
You are a STORY CREATION ENGINE.
`;