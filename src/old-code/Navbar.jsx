import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isCheckout = location.pathname === "/checkout";
  const isBooking = location.pathname === "/booking";
  const isSuccess = location.pathname === "/success";

  const [language, setLanguage] = useState("EN");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);
  const navbarRef = useRef(null);
  const accentRef = useRef(null);
  const lastScrollY = useRef(0);

  const navLinks = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "Stories", id: "stories" },
    { label: "Contact", id: "contact" },
  ];

  const toggleLanguage = () => setLanguage((prev) => (prev === "EN" ? "FR" : "EN"));

  const handleScroll = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
    } else {
      const el = document.getElementById(sectionId);
      if (el) window.lenis ? window.lenis.scrollTo(el) : el.scrollIntoView({ behavior: "smooth" });
      setMenuOpen(false);
    }
  };

  // Navbar scroll hide/show
  useEffect(() => {
    if (isCheckout || isBooking) return;
    const onScroll = () => {
      const currentY = window.scrollY;
      const reachedBottom = currentY + window.innerHeight >= document.documentElement.scrollHeight - 5;

      if (reachedBottom) {
        gsap.to(navbarRef.current, { y: "-100%", duration: 0.4, ease: "power2.inOut" });
        return;
      }
      if (currentY > lastScrollY.current && currentY > 80) {
        gsap.to(navbarRef.current, { y: "-100%", duration: 0.4, ease: "power4.out" });
      } else {
        gsap.to(navbarRef.current, { y: "0%", duration: 0.3, ease: "power4.outIn" });
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isCheckout, isBooking]);

  // Animated accent under links
  useEffect(() => {
    if (!accentRef.current) return;
    gsap.to(accentRef.current, {
      x: "+=15",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  if (isCheckout || isBooking || isSuccess) return null;

  return (
    <nav
      ref={navbarRef}
      className="fixed top-0 left-0 w-full z-50 bg-black/0 backdro-blur-md shadow-md px-4 md:px-8 py-4 text-white transition-all"
    >
      <div className="flex justify-between items-center">
        {/* LEFT: Logo + Links */}
        <div className="flex items-center gap-2">
          <img
            src="/assets/navLogo.png"
            alt="Logo"
            className="h-16 cursor-pointer object-contain"
            onClick={() => handleScroll("top")}
          />
          <div className="hidden sm:flex flex- leading-tight">
            {/* <span className="text-2xl font-frank font-semibold">Cape Frontier</span> */}
            {/* <span className="text-2xl font-frank font-semibold ">Frontier</span> */}
            {/* <span className="text-sm opacity-70">Travel & Tours</span> */}
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-2 ml-4 relative">
            {navLinks.map((link, idx) => (
              <div
                key={link.label}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                onClick={() => handleScroll(link.id)}
                className="relative flex flex-col items-center cursor-pointer px-2 py-1"
              >
                <span className="transition-colors hover:text-blue-400">{link.label}</span>
                <div
                  ref={idx === hoverIndex ? accentRef : null}
                  className={`absolute bottom-0 h-1 rounded-full transition-all ${hoverIndex === idx ? "bg-linear-to-r from-blue-400 to-purple-400 w-full" : "w-0"
                    }`}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Language + CTA + Mobile */}
        <div className="flex items-center gap-4">
          {/* Language */}
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-400 transition-colors relative"
            onClick={toggleLanguage}
          >
            <span>{language}</span>
            <img src="/icons/landing/globe.png" alt="" className="h-6" />
            {/* Small floating indicator */}
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
          </div>

          {/* CTA Button */}
          <button className="hidden md:block bg-blue-500 px-5 py-2 rounded-full hover:bg-blue-600 transition-all font-medium">
            FAQ
          </button>

          {/* Hamburger */}
          <button
            className="text-xl md:hidden lg:hidden border rounded-full p-2 hover:bg-white/10 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
          <button
            className="hidden md:hidden border rounded-full px-5 py-2 hover:bg-white/10 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      <div
        className={`md:hidden mt-2 bg-black/80 backdrop-blur-md rounded-lg flex flex-col items-center py-3 gap-3 transition-all overflow-hidden ${menuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        {navLinks.map((link) => (
          <div
            key={link.label}
            onClick={() => handleScroll(link.id)}
            className="flex items-center gap-2 cursor-pointer hover:text-blue-400 transition-colors"
          >
            <span>{link.label}</span>
            <img src="/icons/downArrow.png" alt="" className="h-3" />
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
