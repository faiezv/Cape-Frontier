import React, { useEffect, useRef, useState } from "react";

/*
 * ============================================================
 * VIDEO ASSETS
 * ============================================================
 *
 * Vite needs assets inside /src/assets to be imported.
 *
 * This glob converts:
 *
 * /src/assets/videos/tours/...
 *
 * into Vite-generated production URLs.
 */
const VIDEO_ASSETS = import.meta.glob(
  "/src/assets/videos/tours/**/*.{mp4,webm,mov}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

/*
 * Resolve a tour video path into the actual Vite asset URL.
 */
function resolveVideo(videoPath) {
  if (!videoPath) return "";

  // Already a URL
  if (
    videoPath.startsWith("http://") ||
    videoPath.startsWith("https://") ||
    videoPath.startsWith("blob:")
  ) {
    return videoPath;
  }

  // Normalize slashes
  const normalizedPath = videoPath.replace(/\\/g, "/");

  /*
   * Direct match.
   *
   * Example:
   * /src/assets/videos/tours/adrenaline/cobra/Vid 1.mp4
   */
  if (VIDEO_ASSETS[normalizedPath]) {
    return VIDEO_ASSETS[normalizedPath];
  }

  /*
   * Fallback:
   * Compare normalized paths in case Vite's glob key
   * differs slightly.
   */
  const match = Object.entries(VIDEO_ASSETS).find(
    ([key]) => key.replace(/\\/g, "/") === normalizedPath
  );

  if (match) {
    return match[1];
  }

  /*
   * Helpful warning during development.
   */
  console.warn("Tour video could not be resolved:", videoPath);

  return "";
}


/* ============================================================ */
/* COMPONENT                                                    */
/* ============================================================ */

const TourVideoStrip = ({ videos }) => {
  const scrollRef = useRef(null);

  const isPointerDown = useRef(false);
  const hasDragged = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const DRAG_THRESHOLD = 8;


  /* ========================================================== */
  /* DRAG START                                                 */
  /* ========================================================== */

  const handlePointerDown = (event) => {
    /*
     * Only respond to primary mouse button.
     * Touch/pen also use button === 0.
     */
    if (event.button !== 0) return;

    const container = scrollRef.current;

    if (!container) return;

    isPointerDown.current = true;
    hasDragged.current = false;

    startX.current = event.clientX;
    startScrollLeft.current = container.scrollLeft;

    setIsDragging(false);
  };


  /* ========================================================== */
  /* DRAG MOVE                                                  */
  /* ========================================================== */

  const handlePointerMove = (event) => {
    const container = scrollRef.current;

    if (!container || !isPointerDown.current) {
      return;
    }

    const distance =
      event.clientX - startX.current;


    /*
     * Ignore tiny movements.
     *
     * This allows a normal click to remain
     * a normal click.
     */
    if (
      !hasDragged.current &&
      Math.abs(distance) < DRAG_THRESHOLD
    ) {
      return;
    }


    /*
     * We are officially dragging.
     */
    hasDragged.current = true;

    setIsDragging(true);


    /*
     * Prevent browser selection while dragging.
     */
    event.preventDefault();


    container.scrollLeft =
      startScrollLeft.current -
      distance;
  };


  /* ========================================================== */
  /* DRAG END                                                   */
  /* ========================================================== */

  const handlePointerUp = () => {
    if (!isPointerDown.current) {
      return;
    }

    isPointerDown.current = false;

    setIsDragging(false);


    /*
     * Keep hasDragged true long enough for
     * the browser's click event to occur.
     */
    if (hasDragged.current) {
      setTimeout(() => {
        hasDragged.current = false;
      }, 50);
    }
  };


  /* ========================================================== */
  /* POINTER CANCEL                                             */
  /* ========================================================== */

  const handlePointerCancel = () => {
    isPointerDown.current = false;
    hasDragged.current = false;

    setIsDragging(false);
  };


  /* ========================================================== */
  /* VIDEO CLICK                                                */
  /* ========================================================== */

  const handleVideoClick = (video) => {
    /*
     * If the user dragged the carousel,
     * don't open the video.
     */
    if (hasDragged.current) {
      return;
    }

    setSelectedVideo(video);
  };


  /* ========================================================== */
  /* WHEEL / TRACKPAD                                           */
  /* ========================================================== */

  const handleWheel = (event) => {
    const container = scrollRef.current;

    if (!container) return;

    if (
      container.scrollWidth <=
      container.clientWidth
    ) {
      return;
    }

    const movement =
      Math.abs(event.deltaX) >
      Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;

    if (!movement) return;

    event.preventDefault();

    container.scrollLeft += movement;
  };


  /* ========================================================== */
  /* BODY LOCK                                                   */
  /* ========================================================== */

  useEffect(() => {
    if (!selectedVideo) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [selectedVideo]);


  /* ========================================================== */
  /* ESC                                                         */
  /* ========================================================== */

  useEffect(() => {
    if (!selectedVideo) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedVideo(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedVideo]);


  /* ========================================================== */
  /* EMPTY STATE                                                 */
  /* ========================================================== */

  if (!videos?.length) {
    return null;
  }


  /* ========================================================== */
  /* RESOLVE VIDEO URLS                                          */
  /* ========================================================== */

  const resolvedVideos = videos
    .map((video) => ({
      original: video,
      url: resolveVideo(video),
    }))
    .filter((video) => video.url);


  if (!resolvedVideos.length) {
    return null;
  }


  /* ========================================================== */
  /* RENDER                                                      */
  /* ========================================================== */

  return (
    <>
      <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-4 lg:-mt-16 lg:px-5">

        <div className="rounded-[1.5rem] border border-blue-100 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:p-4">


          {/* ================================================== */}
          {/* HEADER                                             */}
          {/* ================================================== */}

          <div className="mb- flex items-end justify-between px-1 sm:px-2">

            {/* Header intentionally hidden */}

          </div>


          {/* ================================================== */}
          {/* CAROUSEL                                           */}
          {/* ================================================== */}

          <div
            ref={scrollRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onWheel={handleWheel}
            className={`
              flex
              gap-3
              overflow-x-auto
              pb-2
              select-none
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden

              ${
                isDragging
                  ? "cursor-grabbing"
                  : "cursor-grab"
              }
            `}
            style={{
              /*
               * Allows vertical page scrolling on mobile
               * while still allowing horizontal dragging.
               */
              touchAction: "pan-y",

              scrollBehavior: isDragging
                ? "auto"
                : "smooth",
            }}
          >

            {resolvedVideos.map(
              ({ url, original }, index) => (

                <button
                  key={`${original}-${index}`}
                  type="button"
                  draggable={false}

                  onClick={() =>
                    handleVideoClick(url)
                  }

                  className="
                    group
                    relative
                    w-[82vw]
                    shrink-0
                    overflow-hidden
                    rounded-[1.15rem]
                    bg-neutral-950
                    text-left
                    sm:w-[320px]
                    lg:w-[360px]
                  "
                >

                  {/* ======================================== */}
                  {/* VIDEO THUMBNAIL                          */}
                  {/* ======================================== */}

                  <video
                    src={url}
                    preload="metadata"
                    muted
                    playsInline
                    draggable={false}
                    className="
                      pointer-events-none
                      aspect-video
                      w-full
                      object-cover
                      transition
                      duration-500
                      group-hover:scale-[1.035]
                    "
                  />


                  {/* ======================================== */}
                  {/* HOVER                                     */}
                  {/* ======================================== */}

                  <span
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-black/0
                      transition
                      duration-300
                      group-hover:bg-black/20
                    "
                  />


                  {/* ======================================== */}
                  {/* PLAY BUTTON                               */}
                  {/* ======================================== */}

                  <span
                    className="
                      pointer-events-none
                      absolute
                      left-1/2
                      top-1/2
                      flex
                      h-14
                      w-14
                      -translate-x-1/2
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      bg-white/95
                      text-blue-700
                      shadow-[0_8px_30px_rgba(0,0,0,0.25)]
                      transition-all
                      duration-300
                      group-hover:scale-110
                    "
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="ml-1 h-5 w-5"
                    >
                      <path d="M8 5v14l11-7L8 5Z" />
                    </svg>
                  </span>


                  {/* ======================================== */}
                  {/* WATCH LABEL                               */}
                  {/* ======================================== */}

                  <span
                    className="
                      pointer-events-none
                      absolute
                      bottom-3
                      left-3
                      rounded-full
                      border
                      border-white/20
                      bg-black/50
                      px-3
                      py-1.5
                      font-bitter
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.1em]
                      text-white
                      backdrop-blur-md
                      transition-all
                      duration-300
                      group-hover:border-blue-500
                      group-hover:bg-blue-600
                      group-hover:text-white
                      group-hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)]
                    "
                  >
                    Watch video
                  </span>

                </button>
              )
            )}

          </div>


          {/* ================================================== */}
          {/* DRAG HINT                                          */}
          {/* ================================================== */}

          {resolvedVideos.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-2">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4 text-blue-500"
              >
                <path
                  d="M8 12h8"
                  strokeLinecap="round"
                />

                <path
                  d="m13 7 5 5-5 5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="m11 7-5 5 5 5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <span className="font-bitter text-[10px] font-medium text-neutral-400">
                Drag to explore
              </span>

            </div>
          )}

        </div>

      </section>


      {/* ====================================================== */}
      {/* VIDEO MODAL                                            */}
      {/* ====================================================== */}

      <TourVideoModal
        video={selectedVideo}
        onClose={() =>
          setSelectedVideo(null)
        }
      />
    </>
  );
};


/* ============================================================ */
/* VIDEO MODAL                                                   */
/* ============================================================ */

function TourVideoModal({
  video,
  onClose,
}) {
  const [visible, setVisible] = useState(false);


  /* ========================================================== */
  /* OPEN ANIMATION                                             */
  /* ========================================================== */

  useEffect(() => {
    if (!video) {
      setVisible(false);
      return;
    }

    const frame =
      requestAnimationFrame(() => {
        setVisible(true);
      });

    return () =>
      cancelAnimationFrame(frame);

  }, [video]);


  /* ========================================================== */
  /* EMPTY                                                      */
  /* ========================================================== */

  if (!video) {
    return null;
  }


  /* ========================================================== */
  /* CLOSE                                                       */
  /* ========================================================== */

  const closeModal = () => {
    setVisible(false);

    setTimeout(() => {
      onClose();
    }, 250);
  };


  /* ========================================================== */
  /* RENDER                                                      */
  /* ========================================================== */

  return (
    <div
      className={`
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        p-4
        transition-all
        duration-300
        sm:p-8

        ${
          visible
            ? "bg-black/85 backdrop-blur-md"
            : "bg-black/0"
        }
      `}
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          closeModal();
        }
      }}
    >

      <div
        className={`
          relative
          w-full
          max-w-5xl
          overflow-hidden
          rounded-[1.5rem]
          bg-black
          shadow-[0_30px_100px_rgba(0,0,0,0.5)]
          transition-all
          duration-300

          ${
            visible
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-4 scale-[0.96] opacity-0"
          }
        `}
      >

        {/* ================================================ */}
        {/* CLOSE                                             */}
        {/* ================================================ */}

        <button
          type="button"
          onClick={closeModal}
          aria-label="Close video"
          className="
            absolute
            right-3
            top-3
            z-20
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-white/20
            bg-black/60
            text-white
            backdrop-blur-md
            transition
            hover:bg-white
            hover:text-neutral-950
          "
        >

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >

            <path
              d="M6 6l12 12"
              strokeLinecap="round"
            />

            <path
              d="M18 6 6 18"
              strokeLinecap="round"
            />

          </svg>

        </button>


        {/* ================================================ */}
        {/* VIDEO                                             */}
        {/* ================================================ */}

        <video
          key={video}
          src={video}
          controls
          autoPlay
          playsInline
          className="
            max-h-[82vh]
            w-full
            object-contain
          "
        />

      </div>

    </div>
  );
};


export default TourVideoStrip;