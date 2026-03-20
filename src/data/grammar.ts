import data from "./grammar.json";

export interface RubyToken {
  text: string;
  reading?: string;
}

export interface GrammarExample {
  jp: string;
  kana?: string;
  ru: string;
  zh?: string;
  ruby?: RubyToken[];
}

export interface GrammarPoint {
  id: string;
  lesson: number;
  titleRu: string;
  titleZh: string;
  jlpt?: string;
  grammar: string;
  grammarReading?: string;
  formBefore: string;
  explanation: string;
  explanationZh?: string;
  usageHint?: string;
  usageHintZh?: string;
  level?: string;
  examples: GrammarExample[];
}

type LegacyPoint = {
  id?: string;
  grammar: string;
  formBefore: string;
  explanation: string;
  usageHint?: string;
  level?: string;
  examples: Array<{ jp: string; ru: string }>;
};

type NewPoint = {
  lesson: number;
  title_ru: string;
  title_zh: string;
  jlpt?: string;
  grammar_points: Array<
    | string
    | {
        grammar: string;
        grammar_reading?: string;
        forms?: Array<{ pattern: string; reading?: string }>;
        meaning_ru?: string;
        meaning_zh?: string;
        description_ru?: string;
        description_zh?: string;
        usage_hint_ru?: string;
        usage_hint_zh?: string;
        examples?: Array<{
          jp: string;
          kana?: string;
          ru: string;
          zh?: string;
          ruby?: RubyToken[];
        }>;
      }
  >;
};

function lessonFromLegacyId(id: string | undefined): number {
  if (!id) return 1;
  const match = id.match(/-L(\d+)-/i);
  return match ? Number(match[1]) : 1;
}

function normalizeLegacyPoint(raw: LegacyPoint, index: number): GrammarPoint {
  const lesson = lessonFromLegacyId(raw.id);
  return {
    id: raw.id ?? `legacy-${index}`,
    lesson,
    titleRu: `Урок ${lesson}`,
    titleZh: `第${lesson}课`,
    jlpt: raw.level,
    grammar: raw.grammar,
    formBefore: raw.formBefore,
    explanation: raw.explanation,
    usageHint: raw.usageHint,
    level: raw.level,
    examples: raw.examples.map((ex) => ({
      jp: ex.jp,
      ru: ex.ru,
      zh: undefined,
    })),
  };
}

function normalizeNewLesson(raw: NewPoint): GrammarPoint[] {
  return raw.grammar_points.map((point, idx) => {
    if (typeof point === "string") {
      return {
        id: `lesson-${raw.lesson}-${idx + 1}`,
        lesson: raw.lesson,
        titleRu: raw.title_ru,
        titleZh: raw.title_zh,
        jlpt: raw.jlpt,
        grammar: point,
        formBefore: "",
        explanation: "",
        explanationZh: "",
        level: raw.jlpt,
        examples: [],
      };
    }

    return {
      id: `lesson-${raw.lesson}-${idx + 1}`,
      lesson: raw.lesson,
      titleRu: raw.title_ru,
      titleZh: raw.title_zh,
      jlpt: raw.jlpt,
      grammar: point.grammar,
      grammarReading: point.grammar_reading,
      formBefore: point.forms?.map((f) => f.pattern).join(" / ") ?? "",
      explanation: point.description_ru ?? point.meaning_ru ?? "",
      explanationZh: point.description_zh ?? point.meaning_zh ?? "",
      usageHint: point.usage_hint_ru,
      usageHintZh: point.usage_hint_zh,
      level: raw.jlpt,
      examples: Array.isArray(point.examples)
        ? point.examples.map((ex) => ({
            jp: ex.jp,
            kana: ex.kana,
            ru: ex.ru,
            zh: ex.zh,
            ruby: ex.ruby,
          }))
        : [],
    };
  });
}

function normalizeAll(rawData: unknown): GrammarPoint[] {
  if (!Array.isArray(rawData)) return [];

  const out: GrammarPoint[] = [];
  rawData.forEach((item, index) => {
    if (item && typeof item === "object" && "grammar_points" in item) {
      out.push(...normalizeNewLesson(item as NewPoint));
      return;
    }
    out.push(normalizeLegacyPoint(item as LegacyPoint, index));
  });
  return out;
}

export const grammarPoints: GrammarPoint[] = normalizeAll(data);
