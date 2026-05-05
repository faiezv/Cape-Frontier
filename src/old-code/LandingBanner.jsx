import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const HeaderBanner = ({ onJumpClick }) => {
  const [time, setTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = `${time.getUTCHours().toString().padStart(2,'0')}:${time.getUTCMinutes().toString().padStart(2,'0')}:${time.getUTCSeconds().toString().padStart(2,'0')}`;

  return (
    <div className="flex w-full text-white px-10 py-6 overflow-hidden ">

      {/* Ambient noise overlay */}
      {/* <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-10 pointer-events-none z-10"></div> */}

      {/* * Floating gradient blobs */}
      {/* <motion.div 
        animate={{ x: [0, 50, 0], y: [0, -30, 0], rotate: [0, 20, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-linear-to-tr from-purple-500 via-pink-500 to-green-400 rounded-full opacity-30 blur-3xl z-0"
      ></motion.div>

      <motion.div 
        animate={{ x: [0, -40, 0], y: [0, 20, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-linear-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full opacity-30 blur-3xl z-0"
      ></motion.div> */}

      <div className="z-20 flex w-full justify-between items-center ">

      {/* LEFT: Animated Headline with Premium Loading Slider */}
        <div className="relative group w-full max-w-xl">
          {/* Glow Background
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-green-400 opacity-40 blur-3xl glow-bounce z-0"></div> */}

          {/* Main Headline */}
          <h1 className="text-8xl font-lobster font-bold leading-[0.9] tracking-tight text-white relative z-20 transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:rotate-1">
            Travel <br /> & Tours
          </h1>

          {/* Subtext */}
          <div className="mt-6 relative text-sm font-mont tracking-wide text-white z-20">
            Discover • Explore • Experience

            {/* Infinite Loading Slider */}
            <div className="absolute bottom-[-6px] left-0 w-full h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full loading-bar bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400"></div>
            </div>
          </div>
        </div>

        {/* RIGHT WRAPPER */}
        <div className="flex items-center gap-8">

          {/* CENTER CARD */}
          <motion.div 
            whileInView={{ y: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-10 py-8 shadow-xl z-20"
          >
            <div className="text-center mb-4 font-mont font-semibold tracking-wide">
              {formattedTime} <span className="font-normal opacity-60">(UTC)</span>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={onJumpClick}
                className="px-12 py-2 rounded-full hero-gradient-bl  hover:bg-purple-500 transition font-semibold"
              >
                Book your journey
              </button>

              <button className="px-12 py-2 rounded-full bg-gradient-to-r from-purple-500 to-green-400 hover:opacity-90 transition font-semibold">
                Contact Us
              </button>
            </div>

            <div className="flex justify-center pt-6 gap-4 opacity-80">
              <img className="h-6 hover:scale-110 transition" src="/icons/landing/whatsapp.png" alt="" />
              <img className="h-6 hover:scale-110 transition" src="/icons/landing/gmail.png" alt="" />
              <img className="h-6 hover:scale-110 transition" src="/icons/landing/instagram.png" alt="" />
            </div>
          </motion.div>

          {/* INFO COLUMN */}
          <div className="flex flex-col gap-6 hero-gradient  rounded-2xl  p-8">
            <div>
              <h2 className="text-3xl tracking-wide font-bold font-mont">
                Explore Beyond The <br /> Ordinary
              </h2>

              <div className="opacity-70 font-mont flex gap-3 items-start mt-2">
                <img className="h-4 mt-1" src="/icons/landing/ZAR.png" alt="" />
                <p className="leading-tight">
                  +27 72 036 1915 <b>Nadeem Davids</b><br />
                  <span className="italic opacity-60">Scroll to learn more</span>
                </p>
              </div>
            </div>

            {/* MICRO STATS STRIP */}
            <div className="flex gap-10 text-sm font-mont opacity-70 border-t border-white/10 pt-4">
              <div>
                <div className="text-lg font-bold text-white">150+</div>
                Tours Hosted
              </div>
              <div>
                <div className="text-lg font-bold text-white">4.9★</div>
                Traveller Rating
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeaderBanner;




// CHATGPT 
// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";

// const HeaderBanner = ({ onJumpClick }) => {
//   const [time, setTime] = useState(new Date());

//   useEffect(() => {
//     const timer = setInterval(() => setTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const formattedTime = `${time
//     .getUTCHours()
//     .toString()
//     .padStart(2, "0")}:${time
//     .getUTCMinutes()
//     .toString()
//     .padStart(2, "0")}`;

//   return (
//     <div className="relative w-full px-16 py-20 text-white">

//       {/* Subtle dark fade for readability */}
//       <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent pointer-events-none z-0" />

//       <div className="relative z-10 flex justify-between items-center">

//         {/* LEFT SIDE */}
//         <div className="max-w-xl">

//           <h1 className="text-7xl font-lobster leading-[0.95] tracking-tight">
//             Travel <br /> & Tours
//           </h1>

//           <p className="mt-6 text-lg font-mont text-white/70 tracking-wide">
//             Discover • Explore • Experience
//           </p>

//           <div className="mt-10 flex gap-6">

//             <button
//               onClick={onJumpClick}
//               className="px-10 py-3 rounded-full bg-white text-slate-900 font-semibold hover:scale-105 transition"
//             >
//               Book Your Journey
//             </button>

//             <button className="px-10 py-3 rounded-full border border-white/30 hover:bg-white/10 transition">
//               Contact Us
//             </button>

//           </div>

//           {/* Clean Stats */}
//           <div className="flex gap-12 mt-12 text-sm font-mont text-white/70">
//             <div>
//               <div className="text-2xl font-bold text-white">150+</div>
//               Tours Hosted
//             </div>
//             <div>
//               <div className="text-2xl font-bold text-white">4.9★</div>
//               Traveller Rating
//             </div>
//           </div>

//         </div>

//         {/* RIGHT SIDE */}
//         <div className="relative flex flex-col items-center">

//           {/* BIG LOGO */}
//           <motion.img
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 0.08, scale: 1 }}
//             transition={{ duration: 1.5 }}
//             src="/assets/logo.png"
//             alt="Cape Frontier Logo"
//             className="absolute -top-32 w-[500px] select-none pointer-events-none"
//           />

//           {/* BOOKING CARD */}
//           <motion.div
//             animate={{ y: [0, -8, 0] }}
//             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//             className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl px-12 py-10 shadow-2xl"
//           >

//             <div className="text-center mb-6 font-mont tracking-wide text-white/70">
//               {formattedTime} UTC
//             </div>

//             <div className="flex flex-col gap-4">
//               <button
//                 onClick={onJumpClick}
//                 className="px-12 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 transition font-semibold"
//               >
//                 Book Now
//               </button>

//               <button className="px-12 py-3 rounded-full border border-white/20 hover:bg-white/10 transition">
//                 Contact Us
//               </button>
//             </div>

//           </motion.div>

//         </div>

//       </div>
//     </div>
//   );
// };

// export default HeaderBanner;




// // Deepseek
// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";

// const HeaderBanner = ({ onJumpClick }) => {
//   const [time, setTime] = useState(new Date());

//   useEffect(() => {
//     const timer = setInterval(() => setTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const formattedTime = `${time.getUTCHours().toString().padStart(2, "0")}:${time
//     .getUTCMinutes()
//     .toString()
//     .padStart(2, "0")}:${time.getUTCSeconds().toString().padStart(2, "0")}`;

//   return (
//     <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black text-white overflow-hidden">

//       {/* Animated background blob */}
//       <motion.div
//         animate={{ x: [0, -40, 0], y: [0, 20, 0], rotate: [0, -15, 0] }}
//         transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
//         className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full opacity-30 blur-3xl z-0"
//       />

//       {/* Large logo - top right */}
//       <img
//         src="/assets/logo.png"
//         alt="Company Logo"
//         className="w-full scale-40 h-screen object-contain drop-shadow-2xl z-20"
//       />

//       {/* Horizontal strip (bottom, full width) */}
//       <div
//         className="absolute bottom-0 left-0 w-full bg-black/40 backdrop-blur-md border-t border-white/10 z-30"
//         style={{ height: "8vh", minHeight: "110px" }}
//       >
//         <div className="flex items-center h-full px-8 md:px-16 gap-8 overflow-x-auto scrollbar-hide">
          
//           {/* LEFT: Travel & Tours (vertically centered) */}
//           <div className="flex items-center h-full pr-8 border-r border-white/20">
//             <h1 className="text-4xl md:text-6xl lobsterfont- font-light tracking-wide text-white whitespace-nowrap">
//               Travel <span className="">&</span> Tours
//             </h1>
//           </div>

//           {/* RIGHT: All content in a horizontal row */}
//           <div className="flex items-center gap-8 md:gap-12 flex-1 min-w-0">
            
//             {/* Time */}
//             <div className="font-mont text-base whitespace-nowrap text-gray-300">
//               <span className="text-white font-medium">{formattedTime}</span> UTC
//             </div>

//             {/* Buttons (subtle) */}
//             <button
//               onClick={onJumpClick}
//               className="px-6 py-2 rounded-full border border-white/20 hover:border-white/40 text-sm font-medium transition whitespace-nowrap"
//             >
//               Book
//             </button>
//             <button className="px-6 py-2 rounded-full border border-white/20 hover:border-white/40 text-sm font-medium transition whitespace-nowrap">
//               Contact
//             </button>

//             {/* Social Icons */}
//             <div className="flex gap-4 items-center text-gray-400">
//               <img className="h-5 opacity-70 hover:opacity-100 transition" src="/icons/landing/whatsapp.png" alt="WA" />
//               <img className="h-5 opacity-70 hover:opacity-100 transition" src="/icons/landing/gmail.png" alt="GM" />
//               <img className="h-5 opacity-70 hover:opacity-100 transition" src="/icons/landing/instagram.png" alt="IG" />
//             </div>

//             {/* Stats */}
//             <div className="flex gap-6 text-sm font-mont text-gray-300 whitespace-nowrap">
//               <div><span className="text-white font-medium">150+</span> Tours</div>
//               <div><span className="text-white font-medium">4.9★</span> Rating</div>
//             </div>

//             {/* Contact */}
//             <div className="flex items-center gap-2 text-sm font-mont text-gray-300 whitespace-nowrap">
//               <img className="h-4 opacity-70" src="/icons/landing/ZAR.png" alt="ZAR" />
//               <span>+27 72 036 1915 <span className="text-white font-medium">Nadeem</span></span>
//             </div>

//             {/* Subtle loading bar */}
//             <div className="w-12 h-0.5 overflow-hidden rounded-full bg-white/10">
//               <div className="h-full rounded-full bg-white/30 loading-bar" />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HeaderBanner;
