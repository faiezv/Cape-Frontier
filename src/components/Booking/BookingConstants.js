// src/components/Booking/BookingConstants.js
// ─── Pure data / helpers. No JSX, no React. ──────────────────────

export const slugify = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const TOUR_FOLDER_ALIASES = {
  shark: "adrenaline/shark-cage-diving",
  "shark-cage-diving": "adrenaline/shark-cage-diving",
  gun: "adrenaline/gun-range",
  gunrange: "adrenaline/gun-range",
  "gun-range": "adrenaline/gun-range",
  paragliding: "adrenaline/paragliding",
  "para-gliding": "adrenaline/paragliding",
  snorkel: "adrenaline/snorkelling",
  snorkelling: "adrenaline/snorkelling",
  snorkeling: "adrenaline/snorkelling",
  "lions-head": "hiking/lions-head",
  "lion-s-head": "hiking/lions-head",
  "lion-head": "hiking/lions-head",
  platteklip: "hiking/platteklip",
  "platteklip-gorge": "hiking/platteklip",
  langa: "historical/langa",
  "langa-township": "historical/langa",
  "robben-island": "historical/robben-island",
  "robben-island-tour": "historical/robben-island",
  "peninsula-tour-1": "packages/peninsula-tour-1",
  "peninsula-tour-2": "packages/peninsula-tour-2",
  delaire: "wine-routes/delaire",
  "delaire-graff": "wine-routes/delaire",
  "rust-en-vrede": "wine-routes/rest-en-vrede",
  "rest-en-vrede": "wine-routes/rest-en-vrede",
  spier: "wine-routes/spier",
  tokara: "wine-routes/tokara",
};

export const SPECIAL_GALLERIES = {
  tokara: [
    "/images/tours/wine-routes/tokara/1%20(10).webp",
    "/images/tours/wine-routes/tokara/2%20(9).webp",
    "/images/tours/wine-routes/tokara/3%20(9).webp",
  ],
};

export const getTourSlug = (tour) =>
  tour?.slug || slugify(tour?.title || tour?.info || "");

export const getTourFolder = (tour) => {
  const slug = getTourSlug(tour);
  const title = slugify(tour?.title || tour?.info || "");
  const category = slugify(tour?.category || "");

  if (TOUR_FOLDER_ALIASES[slug]) return TOUR_FOLDER_ALIASES[slug];
  if (TOUR_FOLDER_ALIASES[title]) return TOUR_FOLDER_ALIASES[title];

  if (title.includes("shark")) return "adrenaline/shark-cage-diving";
  if (title.includes("gun")) return "adrenaline/gun-range";
  if (title.includes("snorkel")) return "adrenaline/snorkelling";
  if (title.includes("para")) return "adrenaline/paragliding";
  if (title.includes("lion")) return "hiking/lions-head";
  if (title.includes("platteklip")) return "hiking/platteklip";
  if (title.includes("langa")) return "historical/langa";
  if (title.includes("robben")) return "historical/robben-island";
  if (title.includes("delaire")) return "wine-routes/delaire";
  if (title.includes("rust") || title.includes("rest"))
    return "wine-routes/rest-en-vrede";
  if (title.includes("spier")) return "wine-routes/spier";
  if (title.includes("tokara")) return "wine-routes/tokara";
  if (title.includes("peninsula") && title.includes("2"))
    return "packages/peninsula-tour-2";
  if (title.includes("peninsula")) return "packages/peninsula-tour-1";
  if (category.includes("adrenaline") || category.includes("adventure"))
    return `adrenaline/${slug}`;
  if (category.includes("hiking")) return `hiking/${slug}`;
  if (category.includes("historical")) return `historical/${slug}`;
  if (category.includes("package")) return `packages/${slug}`;
  if (category.includes("wine")) return `wine-routes/${slug}`;
  return slug;
};

export const getTourGallery = (tour) => {
  if (Array.isArray(tour?.images) && tour.images.length > 0) return tour.images;
  const slug = getTourSlug(tour);
  const title = slugify(tour?.title || tour?.info || "");
  if (SPECIAL_GALLERIES[slug]) return SPECIAL_GALLERIES[slug];
  if (SPECIAL_GALLERIES[title]) return SPECIAL_GALLERIES[title];
  const folder = getTourFolder(tour);
  return [1, 2, 3].map((n) => `/images/tours/${folder}/${n}.webp`);
};

// ─── Group + vehicle config ──────────────────────────────────────
export const SEATS_PER_VEHICLE = 8;
export const MAX_VEHICLES = 2;
export const MAX_GUESTS = SEATS_PER_VEHICLE * MAX_VEHICLES;

export const GUEST_BANDS = [
  {
    key: "adult",
    label: "Adults",
    singular: "Adult",
    range: "18+",
    age: null,
  },
  {
    key: "teen",
    label: "Teens",
    singular: "Teen",
    range: "12–17",
    age: 14,
    test: (a) => a >= 12 && a <= 17,
  },
  {
    key: "child",
    label: "Children",
    singular: "Child",
    range: "6–11",
    age: 8,
    test: (a) => a >= 6 && a <= 11,
  },
  {
    key: "toddler",
    label: "Toddlers",
    singular: "Toddler",
    range: "0–5",
    age: 3,
    test: (a) => a <= 5,
  },
];

export const BAND_AGE = { teen: 14, child: 8, toddler: 3 };

export const BAND_INITIAL = {
  adult: "A",
  teen: "T",
  child: "C",
  toddler: "B",
};

export const ageToBand = (age) => {
  if (age <= 5) return "toddler";
  if (age <= 11) return "child";
  if (age <= 17) return "teen";
  return "adult";
};

// ─── Color palette per band ──────────────────────────────────────
export const BAND_COLORS = {
  adult: {
    name: "Blue",
    dot: "bg-sky-500",
    seat: "border-sky-400 bg-sky-200 text-sky-900 hover:bg-sky-300",
    seatActive:
      "border-sky-600 bg-sky-300 text-sky-950 ring-2 ring-sky-500 ring-offset-1",
    track: "bg-sky-500",
    chipBg: "bg-sky-100 text-sky-900",
    legend: "bg-sky-200 border-sky-400",
  },
  teen: {
    name: "Purple",
    dot: "bg-violet-500",
    seat: "border-violet-400 bg-violet-200 text-violet-900 hover:bg-violet-300",
    seatActive:
      "border-violet-600 bg-violet-300 text-violet-950 ring-2 ring-violet-500 ring-offset-1",
    track: "bg-violet-500",
    chipBg: "bg-violet-100 text-violet-900",
    legend: "bg-violet-200 border-violet-400",
  },
  child: {
    name: "Amber",
    dot: "bg-amber-500",
    seat: "border-amber-400 bg-amber-200 text-amber-900 hover:bg-amber-300",
    seatActive:
      "border-amber-600 bg-amber-300 text-amber-950 ring-2 ring-amber-500 ring-offset-1",
    track: "bg-amber-500",
    chipBg: "bg-amber-100 text-amber-900",
    legend: "bg-amber-200 border-amber-400",
  },
  toddler: {
    name: "Pink",
    dot: "bg-pink-500",
    seat: "border-pink-400 bg-pink-200 text-pink-900 hover:bg-pink-300",
    seatActive:
      "border-pink-600 bg-pink-300 text-pink-950 ring-2 ring-pink-500 ring-offset-1",
    track: "bg-pink-500",
    chipBg: "bg-pink-100 text-pink-900",
    legend: "bg-pink-200 border-pink-400",
  },
};

// ─── Duration / style pill formatter ─────────────────────────────
export const formatTourMeta = (value = "") => {
  const cleaned = value
    .toString()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  if (/half\s*day/i.test(cleaned)) return "Half-Day";
  if (/full\s*day/i.test(cleaned)) return "Full-Day";
  return cleaned.replace(/\b\w/g, (letter) => letter.toUpperCase());
};