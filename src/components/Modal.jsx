// components/Modal.jsx
import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";

export const Modal = ({ isOpen, onClose, children, className = "" }) => {
  // Lenis + body/html scroll lock
  useEffect(() => {
    if (!isOpen) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      if (window.lenis) window.lenis.start();
      return;
    }

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (window.lenis) window.lenis.stop();

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow || "";
      document.body.style.overflow = prevBodyOverflow || "";
      if (window.lenis) window.lenis.start();
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={`
        fixed inset-0 z-[99999]
        flex items-center justify-center
        transition-opacity duration-300
        ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}
      `}
      data-lenis-prevent
      onClick={onClose}
    >
      <div
        className={`
          w-full max-w-3xl max-h-[90vh]
          flex flex-col overflow-hidden
          rounded-2xl border-2 border-blue-600
          bg-white shadow-[0_25px_80px_rgba(0,0,0,0.18)]
          transition-all duration-300 ease-out
          ${isOpen ? "translate-y-0 scale-100" : "translate-y-3 scale-[0.97]"}
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
};