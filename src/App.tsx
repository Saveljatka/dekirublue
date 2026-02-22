import { useState, useMemo } from "react";
import { grammarPoints, type GrammarPoint } from "./data/grammar";

function DetailPanel({ point }: { point: GrammarPoint | null }) {
  if (!point) {
    return (
      <div className="detail-panel detail-panel-empty">
        <p>Выберите конструкцию в списке слева — грамматика, пояснение и примеры откроются здесь.</p>
      </div>
    );
  }

  return (
    <div className="detail-panel">
      <div className="detail-head">
        <div className="grammar-chip">
          <span className="grammar-jp">{point.grammar}</span>
          {point.level && <span className="grammar-meta">{point.level}</span>}
        </div>
      </div>

      <div className="detail-block">
        <div className="field-label">Форма перед конструкцией</div>
        <div className="field-main">{point.formBefore}</div>
      </div>

      <div className="detail-block">
        <div className="field-label">Пояснение</div>
        <div className="field-main">{point.explanation}</div>
      </div>

      {point.usageHint && (
        <div className="detail-block">
          <div className="field-label">Подсказка по использованию</div>
          <div className="field-main">{point.usageHint}</div>
        </div>
      )}

      <div className="detail-block">
        <div className="field-label">Примеры</div>
        <ul className="examples-list">
          {point.examples.map((ex, idx) => (
            <li key={idx} className="example-item">
              <div className="example-jp">{ex.jp}</div>
              <div className="example-ru">{ex.ru}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function App() {
  const [selectedId, setSelectedId] = useState<string | null>(grammarPoints[0]?.id ?? null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return grammarPoints;
    return grammarPoints.filter(
      (p) =>
        p.grammar.toLowerCase().includes(q) ||
        p.formBefore.toLowerCase().includes(q) ||
        p.explanation.toLowerCase().includes(q) ||
        (p.level && p.level.toLowerCase().includes(q))
    );
  }, [search]);

  const selected = useMemo(
    () => grammarPoints.find((p) => p.id === selectedId) ?? null,
    [selectedId]
  );

  return (
    <div className="app-root">
      <div className="app-shell">
        <header className="app-header">
          <div className="brand">
            <div className="brand-mark">文</div>
            <div>
              <div className="brand-text-main">JP Grammar Notes</div>
              <div className="brand-text-sub">
                Справочник грамматики — выбери конструкцию, смотри пояснение и примеры
              </div>
            </div>
          </div>
          <div className="header-side">
            <span className="pill">{grammarPoints.length} конструкций</span>
          </div>
        </header>

        <main className="layout layout-split">
          <aside className="list-panel">
            <input
              type="search"
              className="search-input"
              placeholder="Поиск по грамматике, форме, уровню…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Поиск"
            />
            <div className="list-scroll">
              {filtered.length === 0 ? (
                <p className="list-empty">Ничего не найдено</p>
              ) : (
                <ul className="grammar-list">
                  {filtered.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className={`grammar-list-item ${selectedId === p.id ? "grammar-list-item-active" : ""}`}
                        onClick={() => setSelectedId(p.id)}
                      >
                        <span className="grammar-list-grammar">{p.grammar}</span>
                        {p.level && <span className="grammar-list-level">{p.level}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          <section className="detail-wrap">
            <DetailPanel point={selected} />
          </section>
        </main>
      </div>
    </div>
  );
}
