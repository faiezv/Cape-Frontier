// src/utils/ImageLoader.js

// All general images plus everything under tours/ (images, packages, etc.)
const allImageModules = import.meta.glob(
  [
    "/src/assets/images/**/*.{webp,png,jpeg,jpg,svg,avif}",
    "/src/assets/tours/**/*.{webp,png,jpeg,jpg,svg,avif}",
  ],
  { eager: true },
);

const imageMap = {};

for (const fullPath in allImageModules) {
  // '/src/assets/images/tours/x/1.webp' -> 'images/tours/x/1.webp'
  const key = fullPath.replace(/^\/src\/assets\//, "");
  const mod = allImageModules[fullPath];
  imageMap[key] = mod?.default ?? mod;
}

const IMAGE_EXT = /\.(webp|png|jpe?g|svg|avif)$/i;

function normalisePath(path) {
  if (!path) return "";

  let key = String(path).trim();

  // Legacy prefixes used elsewhere in the codebase
  if (key.startsWith("/images/tours/")) {
    key = key.replace("/images/tours/", "tours/images/");
  } else if (key.startsWith("/images/")) {
    key = key.replace("/images/", "images/");
  }

  // Full source paths, with or without a leading slash
  key = key.replace(/^\/?src\/assets\//, "");

  // './x' -> 'x', then drop any remaining leading slash
  key = key.replace(/^\.\//, "").replace(/^\//, "");

  // %20 -> space, to match real filenames in the glob
  try {
    key = decodeURIComponent(key);
  } catch {
    // ignore decoding errors
  }

  return key;
}

// First image inside a folder (direct children first, then nested).
// Numbered files sort first and in numeric order, the rest alphabetically.
export function resolveFolderImage(folder) {
  if (!folder) return null;

  const prefix = normalisePath(folder).replace(/\/+$/, "") + "/";

  const matches = Object.keys(imageMap)
    .filter((key) => key.startsWith(prefix))
    .sort((a, b) => {
      const depthA = a.slice(prefix.length).split("/").length;
      const depthB = b.slice(prefix.length).split("/").length;
      if (depthA !== depthB) return depthA - depthB; // direct children first
      return a.localeCompare(b, undefined, { numeric: true });
    });

  if (matches.length === 0) {
    console.warn("[resolveFolderImage] No images found in:", folder);
    return null;
  }

  return imageMap[matches[0]];
}

// Accepts an exact file path OR a folder path (no extension).
export function resolveImage(path) {
  if (!path) return null;

  // No image extension means it's a folder: grab its first image
  if (!IMAGE_EXT.test(String(path).trim())) {
    return resolveFolderImage(path);
  }

  const key = normalisePath(path);

  if (imageMap[key]) return imageMap[key];

  // Fallback: match on the last TWO segments (folder/filename), so '1.webp'
  // can never match some other folder's '1.webp'.
  const parts = key.split("/");
  const tail = parts.slice(-2).join("/");

  if (parts.length >= 2) {
    for (const mapKey in imageMap) {
      if (mapKey.endsWith(`/${tail}`)) return imageMap[mapKey];
    }
  }

  console.warn("[resolveImage] Image not found:", path);
  return null;
}

export const resolveTourImage = resolveImage;