import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isObject = (value: unknown): boolean => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const capitalizeFirstLetterOfEachWord = (str: string): string => {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const cacheStorage = {
  setItem: (key: string, value: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  },
  getItem: (key: string) => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  },
  removeItem: (key: string) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  },
};

export const encodeBase64 = (str: string) => {
  try {
    return window.btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
        String.fromCharCode(parseInt(p1, 16)),
      ),
    );
  } catch {
    return str;
  }
};

export const decodeBase64 = (str: string) => {
  try {
    return decodeURIComponent(
      Array.prototype.map
        .call(
          window.atob(str),
          (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2),
        )
        .join(""),
    );
  } catch {
    try {
      return window.atob(str);
    } catch {
      return str;
    }
  }
};

export const getCachedVariables = (key?: string) => {
  if (typeof window === "undefined") return {};

  if (key) {
    const encodedKey = window.btoa(key);
    const item = cacheStorage.getItem(encodedKey);
    if (!item) return null;

    const decodedValue = decodeBase64(item);
    try {
      return JSON.parse(decodedValue);
    } catch {
      return decodedValue;
    }
  }

  const keysToRestore = ["userdata", "blogPosts"];
  const result: Record<string, any> = {};
  keysToRestore.forEach((k) => {
    const encodedKey = window.btoa(k);
    const item = cacheStorage.getItem(encodedKey);
    if (item) {
      const val = decodeBase64(item);
      try {
        const parsed = JSON.parse(val);
        // Fix for corrupted array data
        if (k === "blogPosts" && !Array.isArray(parsed)) {
          result[k] = [];
        } else {
          result[k] = parsed;
        }
      } catch {
        result[k] = val;
      }
    }
  });
  return result;
};

export const catchErrorResponse = (e: any) => {
  return (
    e?.response?.data?.error?.message || e?.message || "Something went wrong"
  );
};

export default {
  cn,
  isObject,
  capitalizeFirstLetterOfEachWord,
  cacheStorage,
  getCachedVariables,
  catchErrorResponse,
  encodeBase64,
  decodeBase64,
};
