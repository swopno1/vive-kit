import { PromptModule } from '../../types';

const TONE_GUIDELINES: Record<string, string> = {
  professional: "Maintain a high level of politeness, use structured language, and avoid slang. Focus on competence and reliability.",
  strategic: "Focus on long-term value, business alignment, and mutual growth. Use analytical and forward-looking language.",
  friendly: "Warm, approachable, and personal. Use natural language, gentle phrasing, and light emojis where appropriate.",
  technical: "Precise, data-driven, and detailed. Focus on specifications, logic, and factual accuracy.",
  'sales-focused': "Persuasive, benefit-oriented, and action-driven. Focus on solving pain points and creating urgency.",
  strict: "Direct, firm, and adherence-focused. Clearly state rules, boundaries, and consequences without ambiguity.",
  concise: "Ultra-brief and efficient. Eliminate filler and get straight to the point.",
  premium: "Sophisticated, exclusive, and high-value. Use elegant phrasing and focus on quality and superior experience."
};

export const toneControl: PromptModule = {
  id: 'tone-control',
  name: 'Tone Framework',
  version: '1.0.0',
  description: 'Controls the emotional and stylistic calibration of the response.',
  priority: 30,
  content: (config) => {
    const tone = config.selectedTone || 'professional';
    const guideline = TONE_GUIDELINES[tone] || TONE_GUIDELINES.professional;

    return `### TONE & STYLE (CRITICAL):
You must adopt a **${tone.toUpperCase()}** tone.
Guideline: ${guideline}

When responding, ensure your language choice, sentence structure, and emotional weight align perfectly with this tone.`;
  }
};
