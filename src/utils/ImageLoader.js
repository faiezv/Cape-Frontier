// src/utils/imageLoader.js

// Include both general images and tour images
const allImageModules = import.meta.glob(
  [
    '/src/assets/images/**/*.{webp,png,jpeg,jpg,svg}',
    '/src/assets/tours/images/**/*.{webp,png,jpeg,jpg,svg}',
  ],
  { eager: true }
);

const imageMap = {};

for (const fullPath in allImageModules) {
  let key = fullPath;

  // Remove '/src/assets/' prefix → gives 'images/...' or 'tours/images/...'
  if (key.startsWith('/src/assets/')) {
    key = key.replace('/src/assets/', '');
  }

  imageMap[key] = allImageModules[fullPath].default;
}


function normalisePath(path) {
  if (!path) return '';

  let key = path;

  // Remove common prefixes used in the codebase
  if (key.startsWith('/images/tours/')) {
    key = key.replace('/images/tours/', 'tours/images/');
  } else if (key.startsWith('/images/')) {
    key = key.replace('/images/', 'images/');
  } else if (key.startsWith('/src/assets/tours/images/')) {
    key = key.replace('/src/assets/tours/images/', 'tours/images/');
  } else if (key.startsWith('/src/assets/images/')) {
    key = key.replace('/src/assets/images/', 'images/');
  } else if (key.startsWith('./')) {
    key = key.replace('./', '');
  }

  // Remove any leading slash if still present
  if (key.startsWith('/')) key = key.slice(1);

  // Decode URI components (e.g., %20 → space) to match actual filenames in glob
  try {
    key = decodeURIComponent(key);
  } catch (e) {
    // Ignore decoding errors
  }

  return key;
}

export function resolveImage(path) {

  const key = normalisePath(path);
  if (imageMap[key]) return imageMap[key];

  // Fallback: try to match by filename (last part) – useful if folder structure differs
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