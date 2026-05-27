import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Lock, UserRound } from "lucide-react";
import { login } from "../utils/storage";
import {
  APP_NAME,
  APP_VERSION,
  COMPANY_LOGO_SRC,
  COMPANY_NAME,
} from "../config/app";
export function LoginPage() {
  const navigate = useNavigate();

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
    <main className="login-page">
      <section className="login-shell">
        <div className="login-panel">
          <div className="login-company-brand">
            <img
              src={COMPANY_LOGO_SRC}
              alt={COMPANY_NAME}
              className="login-company-logo"
            />
            <img
              src="/brand/company-logo2.png"
              alt={COMPANY_NAME}
              className="login-company-logo-b"
            />
          </div>
          <div className="login-header">
            <h2>ورود به سامانه</h2>
            <p>برای ادامه، نام کاربری و رمز عبور خود را وارد کنید.</p>
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
              <p className="eyebrow">AI Assistant</p>
            </div>

            <h1>{APP_NAME}</h1>
            <p>
              پرسش خود را به زبان طبیعی مطرح کنید و پاسخ تحلیلی، جدول داده و
              خروجی قابل دانلود دریافت کنید.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
