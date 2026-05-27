import axios from 'axios';

type ErrorContext = 'chat' | 'upload' | 'download' | 'general';

const DEFAULT_MESSAGES: Record<ErrorContext, string> = {
  chat: 'در حال پردازش پیام شما مشکلی رخ داد. لطفاً چند لحظه بعد دوباره تلاش کنید.',
  upload: 'بارگذاری فایل با مشکل مواجه شد. لطفاً فایل را بررسی کرده و دوباره تلاش کنید.',
  download: 'دانلود فایل در حال حاضر امکان‌پذیر نیست. لطفاً کمی بعد دوباره تلاش کنید.',
  general: 'در انجام عملیات مشکلی رخ داد. لطفاً دوباره تلاش کنید.',
};

export function getUserFriendlyErrorMessage(
  error: unknown,
  context: ErrorContext = 'general',
) {
  if (!navigator.onLine) {
    return 'اتصال اینترنت شما برقرار نیست. لطفاً ارتباط خود را بررسی کنید و دوباره تلاش کنید.';
  }

  if (!axios.isAxiosError(error)) {
    return DEFAULT_MESSAGES[context];
  }

  if (error.code === 'ECONNABORTED') {
    return 'زمان پاسخ‌گویی سرور بیش از حد طولانی شد. لطفاً چند لحظه بعد دوباره تلاش کنید.';
  }

  if (!error.response) {
    return 'ارتباط با سرور برقرار نشد. لطفاً وضعیت اتصال یا در دسترس بودن سامانه را بررسی کنید.';
  }

  const status = error.response.status;

  if (status === 400) {
    return 'درخواست ارسال‌شده معتبر نیست. لطفاً اطلاعات واردشده را بررسی کرده و دوباره تلاش کنید.';
  }

  if (status === 401 || status === 403) {
    return 'دسترسی شما برای انجام این عملیات تأیید نشد. لطفاً دوباره وارد سامانه شوید.';
  }

  if (status === 404) {
    return 'منبع موردنظر در سامانه پیدا نشد.';
  }

  if (status === 408) {
    return 'زمان انتظار برای دریافت پاسخ به پایان رسید. لطفاً دوباره تلاش کنید.';
  }

  if (status === 413) {
    return 'حجم فایل یا داده ارسالی بیش از حد مجاز است.';
  }

  if (status === 415) {
    return 'فرمت فایل یا داده ارسالی پشتیبانی نمی‌شود.';
  }

  if (status === 422) {
    return 'اطلاعات ارسال‌شده قابل پردازش نیست. لطفاً ورودی خود را بررسی کنید.';
  }

  if (status === 429) {
    return 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.';
  }

  if (status >= 500) {
    return 'در سرور خطایی رخ داده است. لطفاً چند لحظه بعد دوباره تلاش کنید.';
  }

  return DEFAULT_MESSAGES[context];
}

export function logErrorForDebug(error: unknown, source: string) {
  if (import.meta.env.DEV) {
    console.error(`[${source}]`, error);
  }
}