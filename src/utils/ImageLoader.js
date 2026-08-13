// src/utils/imageLoader.js

const allImageModules = import.meta.glob(
  '/src/assets/images/**/*.{webp,png,jpeg,jpg,svg}',
  { eager: true }
);

const imageMap = {};
for (const fullPath in allImageModules) {
  const relativePath = fullPath.replace('/src/assets/images/', '');
  imageMap[relativePath] = allImageModules[fullPath].default;
}


function normalisePath(path) {
  if (!path) return '';
  let key = path;
  if (key.startsWith('/images/')) key = key.replace('/images/', '');
  else if (key.startsWith('/src/assets/images/')) key = key.replace('/src/assets/images/', '');
  else if (key.startsWith('./')) key = key.replace('./', '');
  if (key.startsWith('/')) key = key.slice(1);
  return key;
}

export function resolveImage(path) {
  if (!path) return fallbackImg;
  const key = normalisePath(path);
  if (imageMap[key]) return imageMap[key];
  // Try to match by filename as a last resort
  const parts = key.split('/');
  const filename = parts[parts.length - 1];
  for (const mapKey in imageMap) {
    if (mapKey.endsWith(filename)) {
      return imageMap[mapKey];
    }
  }
  return fallbackImg;
}

export const resolveTourImage = resolveImage;