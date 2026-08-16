import { useEffect, useMemo, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { resolveImage } from "../../utils/ImageLoader";

const ALL_TOUR_IMAGES = import.meta.glob(
  "/src/assets/images/tours/**/*.{webp,WEBP,png,PNG,jpg,JPG,jpeg,JPEG}",
  {
    eager: true,
    import: "default",
  }
);

const TourGallery = ({
  tour,
  imageFolder,
  mobileInitialImages = 6,
  desktopInitialImages = 8,
}) => {
  const [isCompactLayout, setIsCompactLayout] =
    useState(false);

  const [showAllGalleryImages, setShowAllGalleryImages] =
    useState(false);

  const [mobileVisibleCount, setMobileVisibleCount] =
    useState(mobileInitialImages);

  /*
   * Responsive layout detection
   */
  useEffect(() => {
    const updateLayout = () => {
      setIsCompactLayout(window.innerWidth < 640);
    };

    updateLayout();

    window.addEventListener("resize", updateLayout);

    return () => {
      window.removeEventListener(
        "resize",
        updateLayout
      );
    };
  }, []);

  /*
   * Find every image inside this tour's folder.
   *
   * Example:
   *
   * imageFolder="adrenaline/cobra"
   *
   * matches:
   *
   * /src/assets/images/tours/adrenaline/cobra/1.webp
   * /src/assets/images/tours/adrenaline/cobra/Image 11.jpeg
   * /src/assets/images/tours/adrenaline/cobra/image.png
   */
  const galleryImages = useMemo(() => {
    if (!imageFolder) return [];

    const normalizedFolder = imageFolder
      .replace(/^\/+|\/+$/g, "")
      .toLowerCase();

    const folderPath =
      `/src/assets/images/tours/${normalizedFolder}/`;

    return Object.keys(ALL_TOUR_IMAGES)
      .filter((path) => {
        const normalizedPath = path
          .replace(/\\/g, "/")
          .toLowerCase();

        // Must be inside the requested tour folder
        if (!normalizedPath.startsWith(folderPath)) {
          return false;
        }

        // Exclude everything inside /stops/
        const relativePath = normalizedPath.slice(
          folderPath.length
        );

        return !relativePath.startsWith("stops/");
      })
      .sort((pathA, pathB) =>
        pathA.localeCompare(pathB, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      )
      .map((path) => {
        // Convert the actual filesystem path into the
        // path expected by resolveImage()
        const imagePath = path.replace(
          "/src/assets/",
          ""
        );

        return resolveImage(imagePath);
      })
      .filter(Boolean);
  }, [imageFolder]);


  /*
   * Reset gallery state when changing tours.
   */
  useEffect(() => {
    setShowAllGalleryImages(false);
    setMobileVisibleCount(mobileInitialImages);
  }, [imageFolder, mobileInitialImages]);

  /*
   * Images displayed in the initial grid.
   */
  const galleryImagesForLayout = isCompactLayout
    ? galleryImages.slice(0, mobileVisibleCount)
    : galleryImages.slice(0, desktopInitialImages);

  /*
   * Images hidden behind "See more" on desktop.
   */
  const extraGalleryImages = galleryImages.slice(
    desktopInitialImages
  );

  const hasHiddenGalleryImages =
    extraGalleryImages.length > 0;

  /*
   * Mobile pagination.
   */
  const hasMoreMobileGalleryImages =
    mobileVisibleCount < galleryImages.length;

  const mobileHiddenGalleryCount =
    galleryImages.length - mobileVisibleCount;

  /*
   * Show another three images on mobile.
   */
  const showMoreMobileGalleryImages = () => {
    setMobileVisibleCount((current) =>
      Math.min(
        current + 3,
        galleryImages.length
      )
    );
  };

  /*
   * Expand/collapse desktop gallery.
   */
  const toggleGalleryImages = () => {
    setShowAllGalleryImages((current) => !current);
  };

  /*
   * Keep GSAP/ScrollTrigger aware of the
   * changing image heights.
   */
  const refreshScrollTrigger = () => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  };

  /*
   * No images found.
   */
  if (galleryImages.length === 0) {
    return (
      <section className="w-full">
        <div className="mb-6">
          <span className="mb-1 block font-bitter text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
            Gallery
          </span>

          <h2 className="font-bitter text-2xl font-bold text-neutral-950 md:text-3xl">
            Tour photos
          </h2>
        </div>

        <div className="rounded-[1.25rem] border border-blue-100 bg-blue-50/70 p-6 font-bitter text-sm text-neutral-500">
          Gallery images coming soon.
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      {/* ================================
          HEADER
      ================================= */}

      <div className="mb-6">
        <span className="mb-1 block font-bitter text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
          Gallery
        </span>

        <h2 className="font-bitter text-2xl font-bold text-neutral-950 md:text-3xl">
          Tour photos
        </h2>
      </div>

      {/* ================================
          INITIAL GALLERY
      ================================= */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {galleryImagesForLayout.map(
          (image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`group relative overflow-hidden rounded-[1.25rem] bg-blue-50 ${
                index === 0
                  ? "sm:col-span-2 xl:col-span-2"
                  : ""
              }`}
            >
              <img
                src={image}
                alt={`${tour.title} gallery image ${
                  index + 1
                }`}
                loading={
                  index < 3
                    ? "eager"
                    : "lazy"
                }
                decoding="async"
                onLoad={refreshScrollTrigger}
                className={`w-full object-cover transition duration-500 group-hover:scale-[1.04] ${
                  index === 0
                    ? "h-56 md:h-72"
                    : "h-40"
                }`}
              />
            </button>
          )
        )}

        {/* ================================
            SHOW MORE BUTTON
        ================================= */}

        {(
          (isCompactLayout &&
            hasMoreMobileGalleryImages) ||
          (!isCompactLayout &&
            hasHiddenGalleryImages &&
            !showAllGalleryImages)
        ) && (
          <button
            type="button"
            onClick={
              isCompactLayout
                ? showMoreMobileGalleryImages
                : toggleGalleryImages
            }
            className="group flex h-40 flex-col items-center justify-center rounded-[1.25rem] border border-blue-100 bg-blue-50/85 p-4 text-center transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bitter text-lg font-bold text-blue-700 shadow-sm transition-transform duration-300 group-hover:scale-110">
              +
            </span>

            <span className="mt-3 font-bitter text-sm font-bold text-neutral-950">
              Click to see more
            </span>

            <span className="mt-1 font-bitter text-xs text-blue-600">
              {isCompactLayout
                ? `${Math.min(
                    3,
                    mobileHiddenGalleryCount
                  )} more photos`
                : `${extraGalleryImages.length} more photos`}
            </span>
          </button>
        )}
      </div>

      {/* ================================
          DESKTOP EXTRA GALLERY
      ================================= */}

      {!isCompactLayout &&
        hasHiddenGalleryImages && (
          <div
            className={`grid grid-cols-1 gap-3 overflow-hidden transition-[max-height,opacity,margin] duration-700 ease-out sm:grid-cols-2 xl:grid-cols-3 ${
              showAllGalleryImages
                ? "mt-3 max-h-[2600px] opacity-100"
                : "mt-0 max-h-0 opacity-0"
            }`}
          >
            {extraGalleryImages.map(
              (image, index) => (
                <button
                  key={`${image}-extra-${index}`}
                  type="button"
                  className="group overflow-hidden rounded-[1.25rem] bg-blue-50"
                >
                  <img
                    src={image}
                    alt={`${tour.title} extra gallery image ${
                      index +
                      desktopInitialImages +
                      1
                    }`}
                    loading="lazy"
                    decoding="async"
                    onLoad={
                      refreshScrollTrigger
                    }
                    className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </button>
              )
            )}
          </div>
        )}

      {/* ================================
          COLLAPSE BUTTON
      ================================= */}

      {!isCompactLayout &&
        showAllGalleryImages &&
        hasHiddenGalleryImages && (
          <button
            type="button"
            onClick={toggleGalleryImages}
            className="mt-4 inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 font-bitter text-xs font-bold text-blue-700 transition hover:bg-blue-50"
          >
            Collapse photos
          </button>
        )}
    </section>
  );
};

export default TourGallery;