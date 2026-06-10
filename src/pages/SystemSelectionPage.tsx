import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_SYSTEMS } from '../config/systems';
import { useSystem } from '../contexts/SystemContext';

export function SystemSelectionPage() {
  const navigate = useNavigate();
  const { setSystem } = useSystem();

  useEffect(() => {
    document.title = 'انتخاب سامانه';
  }, []);

  const chatSystems = APP_SYSTEMS.filter((s) => !s.externalUrl);
  const externalSystems = APP_SYSTEMS.filter((s) => s.externalUrl);
  const allSystems = [...chatSystems, ...externalSystems];
  const cardCount = allSystems.length;

  // Evenly-spaced x positions for N cards (0 = leftmost, 1 = rightmost)
  const cardPositions = allSystems.map((_, i) =>
    cardCount === 1 ? 0.5 : i / (cardCount - 1)
  );

  return (
    <main className="system-selection-page">
      <section className="system-selection-shell">
        <header className="system-selection-header">
          <p className="system-selection-eyebrow">انتخاب سامانه</p>
          <h1>به کدام سامانه می‌خواهید وارد شوید؟</h1>
          <p>برای ادامه، یکی از سامانه‌های زیر را انتخاب کنید.</p>
        </header>

        <div className="system-selection-grid">
          {/* Top apex — brand logo */}
          <div className="system-selection-apex" aria-hidden="true">
            <div className="system-selection-apex-circle">
              <img
                src="/brand/company-logo.png"
                alt=""
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Connector lines from apex to cards */}
          <div className="system-selection-connector-wrap" aria-hidden="true">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {cardPositions.map((pos, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="0"
                  x2={pos * 100}
                  y2="100"
                  stroke="rgba(37,196,157,0.25)"
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                />
              ))}
            </svg>
          </div>

          {/* Cards row */}
          <div className="system-selection-bottom-row">
            {/* Chat systems */}
            {chatSystems.map((system) => (
              <button
                key={system.id}
                type="button"
                className={`system-selection-card ${system.themeClass}`}
                aria-label={`ورود به ${system.selectionTitle}`}
                onClick={() => {
                  setSystem(system.id);
                  navigate('/chat', { replace: true });
                }}
              >
                <div className="system-selection-card-visual">
                  <img
                    src={system.coverImageSrc}
                    alt={system.selectionTitle}
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="system-selection-card-content">
                  <h2>{system.selectionTitle}</h2>
                  <span className="system-selection-card-action">ورود</span>
                </div>
              </button>
            ))}

            {/* External systems */}
            {externalSystems.map((system) => (
              <a
                key={system.id}
                href={system.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`system-selection-card ${system.themeClass}`}
                aria-label={`ورود به ${system.selectionTitle}`}
              >
                <div className="system-selection-card-visual">
                  <img
                    src={system.coverImageSrc}
                    alt={system.selectionTitle}
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="system-selection-card-content">
                  <h2>{system.selectionTitle}</h2>
                  <span className="system-selection-card-action">ورود</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
