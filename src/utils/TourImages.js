// src/utils/tourImages.js
const imageModules = import.meta.glob('/src/assets/images/tours/**/*.{webp,png,jpeg,jpg}', { eager: true });

// Build a map: filename (without extension) -> resolved URL
export const imageMap = {};
for (const path in imageModules) {
  const fileName = path.split('/').pop().split('.')[0]; // e.g. "table-mountain"
  imageMap[fileName.toLowerCase()] = imageModules[path].default; // Vite returns { default: URL }
}