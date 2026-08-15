import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, getDay, nextFriday, previousFriday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatGigDate = (value: string) =>
  new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export const formatPrice = (price: number | string | null) =>
  price === null
    ? "Free"
    : new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
        maximumFractionDigits: 0,
      }).format(Number(price));

export const currentWeekend = () => {
  const today = new Date();
  const day = getDay(today);
  const friday =
    day >= 1 && day <= 4
      ? nextFriday(today)
      : day === 5
        ? today
        : previousFriday(today);
  return format(friday, "yyyy-MM-dd");
};

export const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
