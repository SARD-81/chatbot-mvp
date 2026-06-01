export type AppSystemId = 'vakav' | 'dataYar';

export type AppSystemConfig = {
  id: AppSystemId;
  name: string;
  subtitle: string;
  apiBaseUrl: string;
  logoSrc: string;
  secondaryLogoSrc?: string;
  suggestedPrompts: string[];
};

export const DEFAULT_SYSTEM_ID: AppSystemId = 'vakav';

const VAKAV_SYSTEM: AppSystemConfig = {
  id: 'vakav',
  name: 'سامانه واکاو',
  subtitle: 'پرسش خود را بنویسید و پاسخ تحلیلی دریافت کنید.',
  apiBaseUrl:
    import.meta.env.VITE_VAKAV_API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8000',
  logoSrc: '/brand/company-logo.png',
  secondaryLogoSrc: '/brand/company-logo2.png',
  suggestedPrompts: [
    'نمرات دوره فعلی رو به تفکیک تاریخ برام میانگین بگیر.',
    'میانگین نمره نهایی دوره قبل و فعلی رو به تفکیک رده مقایسه کن و ۱۰ رده‌ای که بیشترین میانگین رشد رو داشتن برام لیست کن.',
    'میانگین نمره نهایی دوره قبل و فعلی رو به تفکیک رده مقایسه کن. میانگین رشد هر رده و میانگین نمره نظارتشون رو هم حساب کن و در نهایت فقط ۱۰ رده‌ای که بیشترین میانگین رشد رو داشتن برام لیست کن.',
    'بر اساس وضعیت عملکرد، توزیع رده‌های ما چطوریه؟ تعداد و درصدِ سهم هر وضعیت از کل رو بهم نشون بده.',
  ],
};

const DATA_YAR_SYSTEM: AppSystemConfig = {
  id: 'dataYar',
  name: 'سامانه داده یار',
  subtitle: 'پرسش خود را درباره داده‌های سامانه داده‌یار مطرح کنید.',
  apiBaseUrl: import.meta.env.VITE_DATA_YAR_API_BASE_URL || 'http://localhost:8001',
  logoSrc: '/brand/company-logo.png',
  secondaryLogoSrc: '/brand/company-logo2.png',
  suggestedPrompts: [
    'خلاصه‌ای از داده‌های بارگذاری‌شده بده',
    '۱۰ رکورد اول جدول را نمایش دهید',
    'مقداری از داده‌های بارگذاری‌شده بده',
    'ستون‌های موجود در داده‌ها را معرفی کن',
  ],
};

export const APP_SYSTEMS: AppSystemConfig[] = [VAKAV_SYSTEM, DATA_YAR_SYSTEM];

export function isAppSystemId(value: string): value is AppSystemId {
  return APP_SYSTEMS.some((system) => system.id === value);
}

export function getSystemById(systemId: AppSystemId): AppSystemConfig {
  return APP_SYSTEMS.find((system) => system.id === systemId) ?? VAKAV_SYSTEM;
}

export function getDefaultSystem(): AppSystemConfig {
  return getSystemById(DEFAULT_SYSTEM_ID);
}
