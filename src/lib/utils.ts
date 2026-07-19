import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'long') {
    return d.toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return d.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(time: string, format: '12h' | '24h' = '12h'): string {
  const [hours, minutes] = time.split(':').map(Number);

  if (format === '24h') {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Normalize a Nigerian phone number to E.164 format (+234...).
// This is the single source of truth used everywhere phones are stored or looked
// up (member creation, imports, profile edits, and phone/OTP login), so a number
// entered as 08012345678, 2348012345678, or +2348012345678 always matches.
// Kept in this client-safe module (no node built-ins) so it can also run in the
// browser during Excel import preview.
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  if (digits.startsWith('234')) {
    return `+${digits}`
  }

  if (digits.startsWith('0') && digits.length >= 10) {
    return `+234${digits.slice(1)}`
  }

  // Already in a usable format — prefix + if missing
  return phone.startsWith('+') ? phone : `+${digits}`
}

// Normalize a membership plan name by stripping common decorators that real
// gym ledger sheets attach: parentheticals, bracket annotations, and "+addon" suffixes.
// Examples:
//   "1month (couple)"           → "1month"
//   "walk in[2persons]"         → "walk in"
//   "1 month + personal boxing" → "1 month"
//   "1week+persol traininer (ken)" → "1week"
export function normalizePlanName(raw: string): string {
  return raw
    .trim()
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/\s*\+.*$/, '')
    .trim()
}
