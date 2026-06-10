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

          {/* Bottom row — all three system cards */}
          <div className="system-selection-bottom-row">
            <svg
              className="system-selection-connector"
              viewBox="0 0 100 42"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M50 2 L10 40" stroke="rgba(37,196,157,0.22)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
              <path d="M50 2 L50 40" stroke="rgba(180,120,255,0.22)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
              <path d="M50 2 L90 40" stroke="rgba(92,139,255,0.22)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
            </svg>

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
