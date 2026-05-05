import React, { useRef, useState, useEffect } from "react";

export default function PanoramaStrip({ image }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const animationRef = useRef(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollStartLeft, setScrollStartLeft] = useState(0);
  const [scrollStartTop, setScrollStartTop] = useState(0);

  // Zoom and image dimensions
  const [zoom, setZoom] = useState(1);
  const [naturalWidth, setNaturalWidth] = useState(null);
  const [naturalHeight, setNaturalHeight] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Autopan state
  const [autopanDirection, setAutopanDirection] = useState(1); // 1 for right, -1 for left
  const autopanSpeed = 1; // Increased speed for more noticeable movement

  // Reset when image changes
  useEffect(() => {
    setNaturalWidth(null);
    setNaturalHeight(null);
    setZoom(1);
    setImageLoaded(false);
  }, [image]);

  // Start autopan when image is loaded
  useEffect(() => {
    if (imageLoaded && containerRef.current && !isDragging) {
      startAutopan();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [imageLoaded, isDragging]);

  const startAutopan = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const animate = () => {
      if (!containerRef.current || isDragging || !imageLoaded) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const container = containerRef.current;
      const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
      
      // Don't animate if there's nothing to scroll
      if (maxScrollLeft <= 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      // Calculate new scroll position
      let newScrollLeft = container.scrollLeft + autopanSpeed * autopanDirection;
      
      // Reverse direction if we hit the edges
      if (newScrollLeft >= maxScrollLeft) {
        newScrollLeft = maxScrollLeft;
        setAutopanDirection(-1); // Change direction to left
      } else if (newScrollLeft <= 0) {
        newScrollLeft = 0;
        setAutopanDirection(1); // Change direction to right
      }
      
      container.scrollLeft = newScrollLeft;
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const startDrag = (clientX, clientY) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(clientX);
    setStartY(clientY);
    setScrollStartLeft(containerRef.current.scrollLeft);
    setScrollStartTop(containerRef.current.scrollTop);
    
    // Pause autopan when dragging
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging || !containerRef.current) return;
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;
    containerRef.current.scrollLeft = scrollStartLeft - deltaX;
    containerRef.current.scrollTop = scrollStartTop - deltaY;
  };

  const endDrag = () => {
    setIsDragging(false);
    // Autopan will restart via the useEffect when isDragging becomes false
  };

  const handleImageLoad = (e) => {
    setNaturalWidth(e.target.naturalWidth);
    setNaturalHeight(e.target.naturalHeight);
    setImageLoaded(true);
  };

  // Compute displayed dimensions once natural size is known
  const imageWidth = naturalWidth ? naturalWidth * zoom : undefined;
  const imageHeight = naturalHeight ? naturalHeight * zoom : undefined;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-auto cursor-grab active:cursor-grabbing"
      onMouseDown={(e) => startDrag(e.pageX, e.pageY)}
      onMouseMove={(e) => handleMove(e.pageX, e.pageY)}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onTouchStart={(e) => startDrag(e.touches[0].pageX, e.touches[0].pageY)}
      onTouchMove={(e) => handleMove(e.touches[0].pageX, e.touches[0].pageY)}
      onTouchEnd={endDrag}
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {/* Image with ref and max-w-none to kill global max-width */}
      <img
        ref={imgRef}
        src={image}
        alt=""
        onLoad={handleImageLoad}
        draggable={false}
        className="select-none pointer-events-none max-w-none"
        style={{
          width: imageWidth ? `${imageWidth}px` : "auto",
          height: imageHeight ? `${imageHeight}px` : "100%",
          display: "block",
        }}
      />

      {/* Zoom slider */}
      <div className="fixed hidden flex bottom-10 left-1/2 transform -translate-x-1/2 bg-black/50 text-white rounded-full px-3 py-1 items-center gap-2 text-sm backdrop-blur-sm z-60">
        <span>🔍</span>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="w-24 accent-white"
        />
        <span>{Math.round(zoom * 100)}%</span>
      </div>

      {/* Hide scrollbars */}
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
}
