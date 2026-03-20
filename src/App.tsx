import { useState, useMemo } from "react";
import { grammarPoints, type GrammarPoint } from "./data/grammar";

type Lang = "ru" | "zh";

function renderRuby(
  ruby: { text: string; reading?: string }[] | undefined,
  fallback: string
) {
  if (!ruby || ruby.length === 0) {
    return fallback;
  }

  return ruby.map((token, idx) => {
    if (token.reading) {
      return (
        <ruby key={`${token.text}-${idx}`}>
          {token.text}
          <rt>{token.reading}</rt>
        </ruby>
      );
    }
    return <span key={`${token.text}-${idx}`}>{token.text}</span>;
  });
}

function DetailPanel({ point, lang }: { point: GrammarPoint | null; lang: Lang }) {
  if (!point) {
    return (
      <div className="detail-panel detail-panel-empty">
        <p>
          {lang === "ru"
            ? "Выберите конструкцию в списке слева — грамматика, пояснение и примеры откроются здесь."
            : "请在左侧选择语法点，这里会显示说明和例句。"}
        </p>
      </div>
    );
  }

  const explanation = lang === "zh" ? point.explanationZh : point.explanation;
  const usageHint = lang === "zh" ? point.usageHintZh : point.usageHint;

  return (
    <div className="detail-panel">
      <div className="detail-head">
        <div className="grammar-chip">
          <span className="grammar-jp">{point.grammar}</span>
          {(point.jlpt || point.level) && <span className="grammar-meta">{point.jlpt ?? point.level}</span>}
        </div>
        <div className="lesson-title">{lang === "ru" ? point.titleRu : point.titleZh}</div>
      </div>

      <div className="detail-block">
        <div className="field-label">{lang === "ru" ? "Форма перед конструкцией" : "接续形式"}</div>
        <div className="field-main">{point.formBefore}</div>
      </div>

      <div className="detail-block">
        <div className="field-label">{lang === "ru" ? "Пояснение" : "说明"}</div>
        <div className="field-main">{explanation}</div>
      </div>

      {usageHint && (
        <div className="detail-block">
          <div className="field-label">{lang === "ru" ? "Подсказка по использованию" : "使用提示"}</div>
          <div className="field-main">{usageHint}</div>
        </div>
      )}

      <div className="detail-block">
        <div className="field-label">{lang === "ru" ? "Примеры" : "例句"}</div>
        <ul className="examples-list">
          {point.examples.map((ex, idx) => (
            <li key={idx} className="example-item">
              <div className="example-jp">{renderRuby(ex.ruby, ex.jp)}</div>
              {ex.kana && <div className="example-kana">{ex.kana}</div>}
              {lang === "ru" ? (
                <div className="example-ru">{ex.ru}</div>
              ) : (
                ex.zh && <div className="example-zh">{ex.zh}</div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function App() {
  const [lang, setLang] = useState<Lang>("ru");
  const [search, setSearch] = useState("");

  const pointsForLang = useMemo(() => {
    if (lang === "ru") return grammarPoints;
    return grammarPoints.filter((p) => p.lesson >= 6);
  }, [lang]);

  const [selectedId, setSelectedId] = useState<string | null>(pointsForLang[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pointsForLang;
    return pointsForLang.filter(
      (p) =>
        p.grammar.toLowerCase().includes(q) ||
        p.formBefore.toLowerCase().includes(q) ||
        p.explanation.toLowerCase().includes(q) ||
        (p.explanationZh && p.explanationZh.toLowerCase().includes(q)) ||
        ((p.jlpt ?? p.level) && (p.jlpt ?? p.level)!.toLowerCase().includes(q))
    );
  }, [search, pointsForLang]);

  const groupedByLesson = useMemo(() => {
    const map = new Map<number, GrammarPoint[]>();
    filtered.forEach((point) => {
      const existing = map.get(point.lesson) ?? [];
      existing.push(point);
      map.set(point.lesson, existing);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  const selected = useMemo(
    () => pointsForLang.find((p) => p.id === selectedId) ?? null,
    [selectedId, pointsForLang]
  );

  const firstRuId = grammarPoints[0]?.id ?? null;
  const firstZhId = grammarPoints.find((p) => p.lesson >= 6)?.id ?? null;

  return (
    <div className="app-root">
      <div className="app-shell">
        <header className="app-header">
          <div className="brand">
            <div className="brand-mark">文</div>
            <div>
              <div className="brand-text-main">JP Grammar Notes</div>
              <div className="brand-text-sub">
                {lang === "ru"
                  ? "Справочник грамматики — выбери конструкцию, смотри пояснение и примеры"
                  : "日语语法手册 - 选择语法点查看说明和例句"}
              </div>
            </div>
          </div>
          <div className="header-side">
            <div className="lang-switch">
              <button
                type="button"
                className={`lang-btn ${lang === "ru" ? "lang-btn-active" : ""}`}
                onClick={() => {
                  setLang("ru");
                  setSelectedId(firstRuId);
                }}
              >
                Русский
              </button>
              <button
                type="button"
                className={`lang-btn ${lang === "zh" ? "lang-btn-active" : ""}`}
                onClick={() => {
                  setLang("zh");
                  setSelectedId(firstZhId);
                }}
              >
                中文
              </button>
            </div>
            <span className="pill">
              {pointsForLang.length} {lang === "ru" ? "конструкций" : "语法点"}
            </span>
          </div>
        </header>

        <main className="layout layout-split">
          <aside className="list-panel">
            <input
              type="search"
              className="search-input"
              placeholder={
                lang === "ru"
                  ? "Поиск по грамматике, форме, уровню…"
                  : "按语法、接续、说明搜索..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Поиск"
            />
            <div className="list-scroll">
              {filtered.length === 0 ? (
                <p className="list-empty">{lang === "ru" ? "Ничего не найдено" : "没有找到结果"}</p>
              ) : (
                groupedByLesson.map(([lesson, items]) => (
                  <div key={lesson} className="lesson-group">
                    <div className="lesson-group-title">
                      {lang === "ru" ? `Урок ${lesson}` : `第${lesson}课`}
                    </div>
                    <ul className="grammar-list">
                      {items.map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            className={`grammar-list-item ${selectedId === p.id ? "grammar-list-item-active" : ""}`}
                            onClick={() => setSelectedId(p.id)}
                          >
                            <span className="grammar-list-grammar">{p.grammar}</span>
                            {(p.jlpt || p.level) && <span className="grammar-list-level">{p.jlpt ?? p.level}</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </aside>

          <section className="detail-wrap">
            <DetailPanel point={selected} lang={lang} />
          </section>
        </main>
      </div>
    </div>
  );
}
