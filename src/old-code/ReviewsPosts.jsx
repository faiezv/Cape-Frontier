// import Tooltip from './Tooltip';
// import GoalsCards from './GoalsCards';


// import React, { useRef, useEffect } from "react";
// import { motion } from "framer-motion";
// import gsap from "gsap";


// const reviews = [
//   {
//     rating: "4.7",
//     title: "An unbelievable experience!",
//     description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Assumenda harum voluptatem, dolorem",
//     name: "Allistar Crowling",
//     action: "View Post",
//     profile: "/icons/reviews/p2.png"
//   },
//   {
//     rating: "4.8",
//     title: "Seamless and top-tier!",
//     description: "Dolor sit amet consectetur adipisicing elit. Ex, aliquid!",
//     name: "Jane Doe",
//     action: "View Post",
//     profile: "/icons/reviews/p4.png"
//   },
//   {
//     rating: "4.9",
//     title: "Deeply Immersive!",
//     description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
//     name: "John Smith",
//     action: "View Post",
//     profile: "/icons/reviews/p3.png"
//   },
//   {
//     rating: "5.0",
//     title: "Excellent Support",
//     description: "Consectetur adipisicing elit. Eius, doloremque repellat.",
//     name: "Alice Johnson",
//     action: "View Post",
//     profile: "/icons/reviews/p2.png"
//   }
// ];

// const cardColors = [
//   "bg-brand-pastel-1",
//   "bg-brand-pastel-2",
//   "bg-brand-pastel-3",
//   "bg-brand-pastel-4",
// ];

// const ReviewsPosts = () => {
//   return (
//     <div className="bg-transparent text-white flex flex-col items-center ">
//         {/* // Reviews */}
//         <div className="flex flex-wrap mt-8 gap-4 justify-center">
//             {reviews.map((review, index) => (
//                   <div
//                   key={index}
//                   className={`reviewCard flex flex-col text-black rounded-2xl p-4 gap-8
                  
//                   w-4/5 sm:w-[50%] md:w-xs lg:w-max-md
//                   ${cardColors[index % cardColors.length]}`}
//                 >
//                       <div className="justify- gap-2 h-[20%] flex items-center ">
//                         <div className="">
//                           <img src="/icons/star.png" className='h-8 object-contain' alt="" />
//                         </div>
//                         {review.rating}
//                       </div>
                     
//                       {/* title, descriptoion, name, action, profile */}
//                       <div className="flex-stretch font-frank justify-start h-[40%] flex text-2xl sm:text-5xl font-bold">{review.title}</div>
//                       <div className="flex-stretch font-frank justify-start h-[20%] leading-tight flex items-center">{review.description}</div>
//                       <div className="flex-stretch font-frank justify-start h-[20%] flex items-center gap-4">
//                           <div className="flex flex-[80%] flex-col items-end leading-tight p-2 transition duration-600 hover:bg-green-400">
//                             <p><b>{review.name}</b></p>
//                             <div className='opacity-80'>{review.action}</div>
//                           </div>
//                           <div className="flex-[20%]">
//                             <img src={review.profile} alt="" className="w-full h-auto object-cover" />
//                           </div>
//                       </div>
//                 </div>
//             ))}
//         </div>


//       {/* See More CTA */}
//       <motion.div whileHover={{ scale: 1.05 }} className="m-12 flex justify-center w-full">
//         <div className="flex items-center gap-2 bg-brand-lightblue text-white py-2 px-16 rounded-full font-semibold cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300">
//           <p>See More</p>
//           <img src="/icons/topRightArrow.png" className="w-5 h-5 object-contain" alt="arrow" />
//         </div>
//       </motion.div>
        
        
//     </div>
//   )
// // }
// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// const reviews = [
//   {
//     rating: "4.7",
//     title: "An unbelievable experience!",
//     description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Assumenda harum voluptatem, dolorem",
//     name: "Allistar Crowling",
//     action: "View Post",
//     profile: "/icons/reviews/p2.png"
//   },
//   {
//     rating: "4.8",
//     title: "Seamless and top-tier!",
//     description: "Dolor sit amet consectetur adipisicing elit. Ex, aliquid!",
//     name: "Jane Doe",
//     action: "View Post",
//     profile: "/icons/reviews/p4.png"
//   },
//   {
//     rating: "4.9",
//     title: "Deeply Immersive!",
//     description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
//     name: "John Smith",
//     action: "View Post",
//     profile: "/icons/reviews/p3.png"
//   },
//   {
//     rating: "5.0",
//     title: "Excellent Support",
//     description: "Consectetur adipisicing elit. Eius, doloremque repellat.",
//     name: "Alice Johnson",
//     action: "View Post",
//     profile: "/icons/reviews/p2.png"
//   }
// ];

// const cardColors = [
//   "bg-brand-pastel-1",
//   "bg-brand-pastel-2",
//   "bg-brand-pastel-3",
//   "bg-brand-pastel-4",
// ];

// // Tooltip component that follows cursor
// const FollowingTooltip = ({ visible, x, y, content }) => {
//   if (!visible) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.8 }}
//       animate={{ opacity: 1, scale: 1 }}
//       exit={{ opacity: 0, scale: 0.8 }}
//       transition={{ duration: 0.15 }}
//       className="fixed pointer-events-none z-50 bg-gray-900 text-white text-sm rounded-lg py-2 px-4 shadow-xl flex items-center gap-2"
//       style={{
//         left: x + 20,
//         top: y - 30,
//         transform: "translate(0, -50%)",
//       }}
//     >
//       <span>⭐ {content.rating}</span>
//       <span className="text-gray-300">•</span>
//       <span className="text-gray-300">Click to view</span>
//     </motion.div>
//   );
// };

// const ReviewsPosts = () => {
//   const [tooltip, setTooltip] = useState({
//     visible: false,
//     x: 0,
//     y: 0,
//     content: { rating: "" }
//   });

//   const [hoveredIndex, setHoveredIndex] = useState(null);

//   const handleMouseMove = (e) => {
//     setTooltip(prev => ({
//       ...prev,
//       x: e.clientX,
//       y: e.clientY
//     }));
//   };

//   const showTooltip = (content, e) => {
//     setTooltip({
//       visible: true,
//       x: e.clientX,
//       y: e.clientY,
//       content
//     });
//   };

//   const hideTooltip = () => {
//     setTooltip(prev => ({ ...prev, visible: false }));
//     setHoveredIndex(null);
//   };

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//         delayChildren: 0.2
//       }
//     }
//   };

//   const cardVariants = {
//     hidden: { opacity: 0, y: 30 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
//   };

//   return (
//     <div className="bg-transparent text-white flex flex-col items-center max-w-7xl">
//       <FollowingTooltip
//         visible={tooltip.visible}
//         x={tooltip.x}
//         y={tooltip.y}
//         content={tooltip.content}
//       />

//       {/* Responsive Grid */}
//       <motion.div
//         className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8 px-4"
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//       >
//         {reviews.map((review, index) => (
//           <motion.div
//             key={index}
//             variants={cardVariants}
//             onHoverStart={() => setHoveredIndex(index)}
//             onHoverEnd={() => setHoveredIndex(null)}
//             onMouseEnter={(e) => showTooltip({ rating: review.rating }, e)}
//             onMouseMove={handleMouseMove}
//             onMouseLeave={hideTooltip}
//             className={`reviewCard flex flex-col text-black rounded-3xl p-6 gap-4
//               ${cardColors[index % cardColors.length]}
//               shadow-lg hover:shadow-2xl 
//               border border-white/10 backdrop-blur-sm
//               cursor-pointer
//               transition-all duration-500 ease-in-out
//               ${hoveredIndex === index ? 'h-auto' : 'h-40'}`}
//             style={{
//               transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
//             }}
//           >
//             {/* Rating row - always visible */}
//             <div className="flex items-center gap-2">
//               <img src="/icons/star.png" className="h-6 w-6 object-contain" alt="star" />
//               <span className="font-semibold text-lg">{review.rating}</span>
//             </div>

//             {/* Title - always visible */}
//             <h3 className="font-frank text-4xl sm:text-4xl font-bold leading-tight">
//               {review.title}
//             </h3>

//             {/* Description - fades in on hover */}
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ 
//                 opacity: hoveredIndex === index ? 1 : 0,
//                 height: hoveredIndex === index ? 'auto' : 0
//               }}
//               transition={{ duration: 0.4, delay: 0.1 }}
//               className="overflow-hidden"
//             >
//               <p className="font-frank text-base sm:text-lg text-gray-700 leading-relaxed">
//                 {review.description}
//               </p>
//             </motion.div>

//             {/* Author & action row - fades in on hover with delay */}
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ 
//                 opacity: hoveredIndex === index ? 1 : 0,
//                 y: hoveredIndex === index ? 0 : 10
//               }}
//               transition={{ duration: 0.4, delay: 0.2 }}
//               className="flex items-center gap-4 mt-2"
//             >
//               <div className="flex-1 flex flex-col items-end pr-2 py-1 rounded-lg transition-colors duration-300 hover:bg-green-400/20">
//                 <span className="font-bold text-lg">{review.name}</span>
//                 <span className="text-sm text-gray-600">{review.action}</span>
//               </div>
//               <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
//                 <img
//                   src={review.profile}
//                   alt={review.name}
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//             </motion.div>

//             {/* Additional decorative element that appears on hover */}
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: hoveredIndex === index ? 1 : 0 }}
//               transition={{ duration: 0.3, delay: 0.3 }}
//               className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
//             >
//               <span className="text-white text-xs">✨</span>
//             </motion.div>
//           </motion.div>
//         ))}
//       </motion.div>

//       {/* See More CTA */}
//       <motion.div
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.95 }}
//         className="my-12 flex justify-center w-full"
//       >
//         <div className="flex items-center gap-3 bg-brand-lightblue text-white py-3 px-10 rounded-full font-semibold cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300">
//           <span>See More</span>
//           <img
//             src="/icons/topRightArrow.png"
//             className="w-5 h-5 object-contain"
//             alt="arrow"
//           />
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default ReviewsPosts;



import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
const reviews = [
  {
    rating: "4.7",
    title: "An unbelievable experience!",
    description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Assumenda harum voluptatem, dolorem",
    name: "Allistar Crowling",
    action: "View Post",
    profile: "/icons/reviews/p2.png"
  },
  {
    rating: "4.8",
    title: "Seamless and top-tier!",
    description: "Dolor sit amet consectetur adipisicing elit. Ex, aliquid!",
    name: "Jane Doe",
    action: "View Post",
    profile: "/icons/reviews/p4.png"
  },
  {
    rating: "4.9",
    title: "Deeply Immersive!",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
    name: "John Smith",
    action: "View Post",
    profile: "/icons/reviews/p3.png"
  },
  {
    rating: "5.0",
    title: "Excellent Support",
    description: "Consectetur adipisicing elit. Eius, doloremque repellat.",
    name: "Alice Johnson",
    action: "View Post",
    profile: "/icons/reviews/p2.png"
  }
];

const cardColors = [
  "bg-brand-pastel-1",
  "bg-brand-pastel-2",
  "bg-brand-pastel-3",
  "bg-brand-pastel-4",
];


const FollowingTooltip = ({ visible, x, y, content }) => {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
      className="fixed pointer-events-none z-50 bg-gray-900 text-white text-sm rounded-lg px-4 shadow-xl flex items-center gap-2"
      style={{
        left: x + 20,
        top: y - 30,
        transform: "translate(0, -50%)",
      }}
    >
      <span>⭐ {content.rating}</span>
      <span className="text-gray-300">•</span>
      <span className="text-gray-300">Click to view</span>
    </motion.div>
  );
};

const ReviewsPosts = () => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: { rating: "" }
  });

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleMouseMove = (e) => {
    setTooltip(prev => ({
      ...prev,
      x: e.clientX,
      y: e.clientY
    }));
  };

  const showTooltip = (content, e) => {
    setTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      content
    });
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
    setHoveredIndex(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="bg-transparent text-white flex flex-col items-center max-w-7xl mx-auto">
      <FollowingTooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        content={tooltip.content}
      />

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {reviews.map((review, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <motion.div
              key={index}
              variants={cardVariants}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              onMouseEnter={(e) => showTooltip({ rating: review.rating }, e)}
              onMouseMove={handleMouseMove}
              onMouseLeave={hideTooltip}
              className={`reviewCard flex flex-col text-black rounded-3xl p-2 gap-4 relative
                ${cardColors[index % cardColors.length]}
                shadow-lg hover:shadow-2xl 
                border border-white/10 backdrop-blur-sm
                cursor-pointer
                transition-all duration-500 ease-in-out
                max-h-28 ${isHovered ? 'max-h-[800px]' : ''} overflow-hidden`}
              style={{
                transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Rating & Title row - changes from row to column on hover */}
              <div className={`flex ${isHovered ? 'flex-col items-start' : 'flex-col items-center gap-2'} w-full`}>
                <div className="flex items-start place-self-start gap-2">
                  <img src="/icons/star.png" className="h-5 w-5 object-contain" alt="star" />
                  <span className="font-bold text">{review.rating}</span>
                </div>
                <h3 className={`font-frank font-bold text-black leading-tight ${
                  isHovered 
                    ? 'text-4xl mt-2' 
                    : 'text-xl truncate flex-1 mb-'
                }`}>
                  {review.title}
                </h3>
              </div>

              {/* Description - visible only on hover */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3, delay: isHovered ? 0.1 : 0 }}
                className="overflow-hidden"
              >
                <p className="font-frank text-base sm:text-lg text-gray-700 leading-relaxed">
                  {review.description}
                </p>
              </motion.div>

              {/* Author & action row - visible only on hover */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: isHovered ? 1 : 0,
                  y: isHovered ? 0 : 10
                }}
                transition={{ duration: 0.3, delay: isHovered ? 0.2 : 0 }}
                className="flex items-center gap-4 mt-2"
              >
                <div className="flex-1 flex flex-col items-end pr-2 py-1 rounded-lg transition-colors duration-300 hover:bg-green-400/20">
                  <span className="font-bold text-lg">{review.name}</span>
                  <span className="text-sm text-gray-600">{review.action}</span>
                </div>
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img
                    src={review.profile}
                    alt={review.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Decorative sparkle on hover */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <span className="text-white text-xs">✨</span>
              </motion.div>

              {/* Animated CTA: shows only when collapsed */}
              <AnimatePresence>
                {!isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 text-xs text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-md"
                  >
                    <span>Hover to expand</span>
                    <motion.div
                      animate={{ y: [0, 3, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      ↓
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="my-12 flex justify-center w-full"
      >
        <div className="flex items-center gap-3 bg-brand-lightblue text-white py-3 px-10 rounded-full font-semibold cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300">
          <span>See More</span>
          <img
            src="/icons/topRightArrow.png"
            className="w-5 h-5 object-contain"
            alt="arrow"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ReviewsPosts;