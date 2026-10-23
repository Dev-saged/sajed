
export type Language = 'English' | 'Arabic';
export type AgeGroup = '3-4' | '4-6' | '7-9' | '9-12';
export type AspectRatio = '9:16' | '16:9';
export type ArtStyle = string; // Relaxed to support expanded style list

export interface StoryParams {
  idea: string;
  language: Language;
  dialect?: string; // Specific dialect for the story
  storyType: string;
  ageGroup: AgeGroup;
  pageCount: number;
  aspectRatio: AspectRatio;
  artStyle: ArtStyle;
}

export interface Character {
  name: string;
  description: string;
  personality: string;
  age: string | number;
  gender: string;
}

export interface StoryPage {
  page: number;
  text: string;
  image_prompt: string;
  generatedImage?: string; // base64 data
  isGeneratingImage?: boolean;
  imageError?: boolean;
}

export interface StoryData {
  story_info: {
    title: string;
    language: string;
    dialect?: string;
    age_group: string;
    art_style: string;
    // We inject aspect_ratio manually in the service layer because strict JSON output from AI doesn't include it
    aspect_ratio: AspectRatio; 
    lessons?: string[]; // Extracted moral lessons if applicable
  };
  characters: Character[];
  pages: StoryPage[];
}

export interface StoryState {
  step: 'setup' | 'generating_story' | 'reading';
  params: StoryParams;
  data: StoryData | null;
  error: string | null;
}
