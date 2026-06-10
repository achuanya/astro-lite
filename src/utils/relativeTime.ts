interface RelativeTimeStrings {
  secondsAgo: string;
  minuteAgo: string;
  minutesAgo: (n: number) => string;
  hourAgo: string;
  hoursAgo: (n: number) => string;
  dayAgo: string;
  daysAgo: (n: number) => string;
  monthAgo: string;
  monthsAgo: (n: number) => string;
  yearAgo: string;
  yearsAgo: (n: number) => string;
}

export function parseDate(date: string): Date {
  const normalized = date
    .replace(/年/g, "-")
    .replace(/月/g, "-")
    .replace(/日/g, "");
  return new Date(normalized);
}

export function relativeTime(
  date: string | Date,
  rt: RelativeTimeStrings,
): string {
  const now = new Date();
  const target = typeof date === "string" ? parseDate(date) : date;
  const diffMs = now.getTime() - target.getTime();

  if (diffMs < 0) return rt.secondsAgo;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return rt.secondsAgo;
  if (minutes < 2) return rt.minuteAgo;
  if (minutes < 60) return rt.minutesAgo(minutes);
  if (hours < 2) return rt.hourAgo;
  if (hours < 24) return rt.hoursAgo(hours);
  if (days < 2) return rt.dayAgo;
  if (days < 30) return rt.daysAgo(days);
  if (months < 2) return rt.monthAgo;
  if (months < 12) return rt.monthsAgo(months);
  if (years < 2) return rt.yearAgo;
  return rt.yearsAgo(years);
}