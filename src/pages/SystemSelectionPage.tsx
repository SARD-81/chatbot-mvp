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

  return (
    <main className="system-selection-page">
      <section className="system-selection-shell">
        <header className="system-selection-header">
          <p className="system-selection-eyebrow">انتخاب سامانه</p>
          <h1>به کدام سامانه می‌خواهید وارد شوید؟</h1>
          <p>برای ادامه، یکی از سامانه‌های زیر را انتخاب کنید.</p>
        </header>

        <div className="system-selection-grid">
          {APP_SYSTEMS.map((system) => (
            <button
              key={system.id}
              type="button"
              className={`system-selection-card ${system.themeClass}`}
              aria-label={`ورود به ${system.selectionTitle}`}
              onClick={() => {
                setSystem(system.id);
                // After system selection, go directly to chat
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
                <span className="system-selection-card-fallback">
                  {system.selectionTitle}
                </span>
              </div>

              <div className="system-selection-card-content">
                <h2>{system.selectionTitle}</h2>
                <p>{system.selectionDescription}</p>
                <span className="system-selection-card-action">ورود به سامانه</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
