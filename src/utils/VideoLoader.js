const videos = import.meta.glob(
  "/src/assets/videos/**/*.{mp4,webm,mov}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

export function resolveVideo(path) {
  if (!path) return "";

  // Already a generated URL
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  const normalized = path.replace(/\\/g, "/");

  const match = Object.entries(videos).find(([key]) => {
    return key === normalized;
  });

  return match?.[1] || "";
}