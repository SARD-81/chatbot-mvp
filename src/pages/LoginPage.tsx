import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, UserRound } from "lucide-react";
import { login, isAuthenticated } from "../utils/storage";
import { APP_VERSION } from "../config/app";

const BRAND_NAME = "سامانه‌های هوشمند بهاران";
const BRAND_SUBTITLE = "دستیار هوشمند تحلیل و پردازش اطلاعات سازمانی";
const BRAND_EYEBROW = "هوش مصنوعی سازمانی";

export function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/systems", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    document.title = `${BRAND_NAME} | ورود`;
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const ok = login(username.trim(), password.trim());

    if (!ok) {
      setError("نام کاربری یا رمز عبور صحیح نیست.");
      return;
    }

    navigate("/systems", { replace: true });
  }

  return (
    <main className="login-page theme-vakav">
      <section className="login-shell">
        <div className="login-panel">
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
            <div className="login-company-brand">
              <img
                src="/brand/company-logo.png"
                alt={BRAND_NAME}
                className="login-company-logo"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <img
                src="/brand/company-logo2.png"
                alt={BRAND_NAME}
                className="login-company-logo-b"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>

            <p className="eyebrow">{BRAND_EYEBROW}</p>
            <h1>{BRAND_NAME}</h1>
            <p>{BRAND_SUBTITLE}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
