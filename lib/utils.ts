import { BlobServiceClient } from "@azure/storage-blob";
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

export interface ImageValidationRules {
  width?: number;
  height?: number;
  ratio?: number;
  tolerance?: number;
  maxSizeInMB?: number;
  allowedFormats?: string[];
}

export const validateImage = (
  file: File,
  rules: ImageValidationRules,
): Promise<string | null> => {
  return new Promise((resolve) => {
    // Check file size
    if (rules.maxSizeInMB) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > rules.maxSizeInMB) {
        resolve(
          `Velikost souboru musí být menší než ${
            rules.maxSizeInMB
          } MB. Vaše velikost: ${fileSizeInMB.toFixed(2)} MB.`,
        );
        return;
      }
    }

    // Check file format
    if (rules.allowedFormats) {
      if (!rules.allowedFormats.includes(file.type)) {
        resolve(
          `Nesprávný formát souboru. Povolené formáty: ${rules.allowedFormats
            .map((f) => f.split("/")[1].toUpperCase())
            .join(", ")}.`,
        );
        return;
      }
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const { width, height } = img;

      // Check specific dimensions if provided
      if (rules.width && width !== rules.width) {
        resolve(
          `Šířka obrázku musí být přesně ${rules.width}pixelů. Nalezeno: ${width}pixelů.`,
        );
        return;
      }

      if (rules.height && height !== rules.height) {
        resolve(
          `Výška obrázku musí být přesně ${rules.height}pixelů. Nalezeno: ${height}pixelů.`,
        );
        return;
      }

      // Check aspect ratio if provided
      if (rules.ratio) {
        const currentRatio = width / height;
        const tolerance = rules.tolerance || 0.01;
        if (Math.abs(currentRatio - rules.ratio) > tolerance) {
          resolve(`Vybraný obrázek tomuto požadavku neodpovídá.`);
          return;
        }
      }

      resolve(null);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve("Invalid image file.");
    };

    img.src = objectUrl;
  });
};

export const slugify = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const saveImageToBlob = async (
  base64Data: string | null,
  folder: string = "uploads",
): Promise<string | null> => {
  if (!base64Data) return null;

  if (!base64Data.startsWith("data:image")) {
    return base64Data;
  }

  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING!,
    );

    const type = matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    const extension = type.split("/")[1];
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${extension}`;

    const blobName = folder ? `${folder}/${filename}` : filename;

    const containerClient = blobServiceClient.getContainerClient(
      process.env.AZURE_STORAGE_CONTAINER_NAME!
    );
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: type,
      },
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error("Error uploading to blob:", error);
    return null;
  }
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
  validateImage,
};
