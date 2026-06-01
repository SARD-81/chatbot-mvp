import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Lock, UserRound } from "lucide-react";
import { login } from "../utils/storage";
import { APP_VERSION } from "../config/app";
import { useSystem } from "../contexts/SystemContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { activeSystem } = useSystem();
  const visualEyebrow =
    activeSystem.id === "dataYar" ? "Data Workspace" : "AI Assistant";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const ok = login(username.trim(), password.trim());

    if (!ok) {
      setError("نام کاربری یا رمز عبور صحیح نیست.");
      return;
    }

    navigate("/chat", { replace: true });
  }

  return (
    <main className={`login-page ${activeSystem.themeClass}`}>
      <section className="login-shell">
        <div className="login-panel">
          <div className="login-company-brand">
            <img
              src={activeSystem.logoSrc}
              alt={activeSystem.name}
              className="login-company-logo"
            />
            {activeSystem.secondaryLogoSrc && (
              <img
                src={activeSystem.secondaryLogoSrc}
                alt={activeSystem.name}
                className="login-company-logo-b"
              />
            )}
          </div>
          <div className="login-header">
            <h2>ورود به سامانه</h2>
            <p>
              برای ادامه ورود به {activeSystem.name}، نام کاربری و رمز عبور خود
              را وارد کنید.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label>
              <span>نام کاربری</span>
              <div className="input-box">
                <UserRound size={18} />
                <input
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setError("");
                  }}
                  placeholder="نام کاربری"
                  autoComplete="username"
                />
              </div>
            </label>

            <label>
              <span>رمز عبور</span>
              <div className="input-box">
                <Lock size={18} />
                <input
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="رمز عبور"
                  type="password"
                  autoComplete="current-password"
                />
              </div>
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="primary-button">
              ورود
            </button>
          </form>

          <button
            type="button"
            className="change-system-button"
            onClick={() => navigate("/systems", { replace: true })}
          >
            تغییر سامانه
          </button>

          <div className="login-version">نسخه {APP_VERSION}</div>
        </div>

        <div className="login-visual">
          <div className="login-glow login-glow-one" />
          <div className="login-glow login-glow-two" />

          <div className="brand-card">
            <div>
              <div className="brand-icon">
                <Bot size={34} />
              </div>
              <p className="eyebrow">{visualEyebrow}</p>
            </div>

            <h1>{activeSystem.name}</h1>
            <p>{activeSystem.subtitle}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
