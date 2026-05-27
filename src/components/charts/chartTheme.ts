import { useEffect, useMemo, useState } from "react";
import type { ChartPalette } from "./types";

function normalizeCssColor(value: string | null | undefined, fallback: string) {
  const raw = (value ?? "").trim();
  if (!raw) return fallback;

  if (
    raw.startsWith("#") ||
    raw.startsWith("rgb") ||
    raw.startsWith("hsl") ||
    raw.startsWith("oklch") ||
    raw.startsWith("color(")
  ) {
    return raw;
  }

  return `hsl(${raw})`;
}

function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const styles = getComputedStyle(document.documentElement);
  return normalizeCssColor(styles.getPropertyValue(name), fallback);
}

export function useEnterpriseChartPalette(): ChartPalette {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => forceUpdate((v) => v + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return useMemo(
    () => ({
      primary: cssVar("--primary", "#2563eb"),
      primarySoft: cssVar("--primary-foreground", "#dbeafe"),
      accent: cssVar("--accent", "#7c3aed"),
      success: cssVar("--success", "#16a34a"),
      warning: cssVar("--warning", "#f59e0b"),
      danger: cssVar("--destructive", "#dc2626"),
      foreground: cssVar("--foreground", "#0f172a"),
      mutedForeground: cssVar("--muted-foreground", "#64748b"),
      border: cssVar("--border", "#e2e8f0"),
      card: cssVar("--card", "#ffffff"),
      grid: cssVar("--border", "#e5e7eb"),
      tooltipBg: cssVar("--popover", "#ffffff"),
    }),
    []
  );
}

export const chartFontFamily =
  "IRANSansX, Vazirmatn, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export function enterpriseTooltipCss() {
  return [
    "min-width: 160px",
    "border-radius: 16px",
    "padding: 10px 12px",
    "box-shadow: 0 18px 50px rgba(15, 23, 42, 0.16)",
    "backdrop-filter: blur(16px)",
    `font-family: ${chartFontFamily}`,
  ].join(";");
}