export type AppSystemId = 'vakav' | 'dataYar';

export type AppSystemConfig = {
  id: AppSystemId;
  name: string;
  subtitle: string;
  apiBaseUrl: string;
  logoSrc: string;
  secondaryLogoSrc?: string;
  suggestedPrompts: string[];
  selectionTitle: string;
  selectionDescription: string;
  coverImageSrc: string;
  themeClass: string;
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
  selectionTitle: 'سامانه واکاو',
  selectionDescription: 'دستیار تحلیلی برای پرسش، گزارش‌گیری و مشاهده نمودارهای مدیریتی.',
  coverImageSrc: '/brand/system-vakav.png',
  themeClass: 'system-theme-vakav',
  suggestedPrompts: [
    'نمرات دوره فعلی رو به تفکیک تاریخ برام میانگین بگیر.',
    'بر اساس ستونِ دقیقِ «نمره_دوره_فعلی»، ترازِ رده‌ها رو حساب کن. سیستم باید اول میانگینِ این ستون رو برای کل نفراتِ هر «رده» به دست بیاره، و بعد ترازِ اون رده‌ها رو محاسبه کنه. در نهایت، لیست رده‌ها رو به ترتیب از بالاترین تراز بهم نشون بده.',
    'میانگین نمره نهایی دوره قبل و فعلی رو به تفکیک رده مقایسه کن و ۱۰ رده‌ای که بیشترین میانگین رشد رو داشتن برام لیست کن.',
    'میانگین نمره نهایی دوره قبل و فعلی رو به تفکیک رده مقایسه کن. میانگین رشد هر رده و میانگین نمره نظارتشون رو هم حساب کن و در نهایت فقط ۱۰ رده‌ای که بیشترین میانگین رشد رو داشتن برام لیست کن.',
    'بر اساس وضعیت عملکرد، توزیع رده‌های ما چطوریه؟ تعداد و درصدِ سهم هر وضعیت از کل رو بهم نشون بده.',
  ],
};

const DATA_YAR_SYSTEM: AppSystemConfig = {
  id: 'dataYar',
  name: 'سامانه جیراکاو',
  subtitle: 'پرسش خود را درباره تسک‌ها، وضعیت‌ها، زمان صرف‌شده و داده‌های جیرا مطرح کنید.',
  apiBaseUrl: import.meta.env.VITE_DATA_YAR_API_BASE_URL || 'http://172.16.16.248:8088',
  logoSrc: '/brand/company-logo.png',
  secondaryLogoSrc: '/brand/company-logo2.png',
  selectionTitle: 'سامانه جیراکاو',
  selectionDescription: 'دستیار تحلیلی جیرا برای پرسش از تسک‌ها، وضعیت‌ها، ارجاع‌ها و گزارش‌های تیمی.',
  coverImageSrc: '/brand/system-data-yar.png',
  themeClass: 'system-theme-data-yar',
  suggestedPrompts: [
    '«سید امیررضا داورزنی» چند تسک در وضعیت انجام شده (Done) و چند تسک In Progress دارد؟',
    'مجموع زمان صرف شده (به ساعت) برای تسک‌های از نوع Bug چقدر است؟',
    'بیشترین تسک‌ها به چه کسانی ارجاع (assignee) داده شده است؟ (رده‌بندی ۵ نفر اول)',
    'پنج تسک آخری که با اولویت Highest ساخته شده‌اند چه هستند (کلید و عنوان)؟',
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
