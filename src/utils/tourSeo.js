import { site } from "./siteConfig.js";

const MAX_TITLE = 60;
const MAX_DESC = 160;

const truncate = (text, max) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).trimEnd() + "…";
};

// "Lion’s Head Guided Hike in Cape Town | Cape Frontier Tours"
//   -> "Lion’s Head Guided Hike in Cape Town"
const stripBrand = (title = "") =>
  title.replace(/\s*[|–-]\s*Cape Frontier.*$/i, "").trim();

export function getTourSeo(tour) {
  const base = stripBrand(tour.seo?.title || tour.title);
  const tag = site.tourTitleTag;

  const withBrand = `${base} | ${tag} | Cape Frontier`;
  const withoutBrand = `${base} | ${tag}`;

  return {
    title: withBrand.length <= MAX_TITLE ? withBrand : withoutBrand,
    description: truncate(
      `${site.tourDescLead} ${tour.seo?.description || tour.description || ""}`.trim(),
      MAX_DESC,
    ),
  };
}