import data from "./grammar.json";

export interface GrammarExample {
  jp: string;
  ru: string;
}

export interface GrammarPoint {
  id: string;
  grammar: string;
  formBefore: string;
  explanation: string;
  usageHint?: string;
  level?: string;
  examples: GrammarExample[];
}

export const grammarPoints: GrammarPoint[] = data as GrammarPoint[];
