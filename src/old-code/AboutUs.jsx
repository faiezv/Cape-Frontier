// import React from 'react'

// const AboutUs = () => {
//   return (
// <div className='flex flex-col md:flex-row text-white max-w-7xl mx-auto mt-8 gap-8 '>
//   {/* Logo Section */}
//   <div className="logo flex-1 flex flex-col justify-between items-center px-4">
//     <div className="flex items-center justify-center w-full">
//       <img  
//         src="assets/logoSlogan.png"  
//         alt="Badge 2" 
//         className="w-[60%] sm:w-[50%] md:w-[72%] lg:w-[50%]"
//       /> 
//     </div> 
//     <div className="rounded-full px-8 sm:px-16 py-2 flex justify-center w-fit sm:w-fit mt-4 hero-gradient-bl">
//       Get in Touch
//     </div>
//   </div>

//   {/* About Us Section */}
//   <div className="aboutUs flex-1 flex flex-col font-frank">
//     <h2 className="text-3xl sm:text-4xl mb-4 sm:mb-6">
//       Who are we?
//     </h2>
//     <hr className='w-full mb-4 sm:mb-8'/>
//     <div className="text-sm sm:text-base leading-relaxed">
//       With Cape Frontier Travel & Tours, every city tour becomes an unforgettable experience. Explore iconic landmarks, vibrant streets, rich history, and hidden gems, then venture into the stunning Winelands.
//       <br /><br /> 
//       Stroll through rolling vineyards, taste world-class wines, and enjoy gourmet food pairings—all while soaking in breathtaking scenery. Our tours blend exploration with the elegance and flavour of the Winelands, making every journey effortless, exciting, and memorable.     
//     </div>
//   </div>
// </div>
//   )
// }

// export default AboutUs

import React from 'react';

const AboutUs = () => {
  return (
    <div className="relative  from-gray-900 to-black overflow-hidden border-white">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000" />
      </div>

      {/* Main content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          
          {/* Logo Section */}
          <div className="w-full lg:w-1/2 flex flex-col items-center space-y-8">
            {/* Animated logo container */}
            <div className="relative group">
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
              
              {/* Logo with animation */}
              <div className="relative transform transition-transform duration-500 group-hover:scale-105">
                <img  
                  src="assets/logoSlogan.png"  
                  alt="Cape Frontier Travel & Tours" 
                  className="w-64 sm:w-80 md:w-96 lg:w-[400px] xl:w-[450px] mx-auto drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Animated decorative line */}
            <div className="w-32 h-1 hero-gradient rounded-full animate-pulse" />

            {/* CTA Button with enhanced styling */}
            <button className="relative group px-8 sm:px-12 py-2 sm:py-3 hero-gradient text-white font-semibold rounded-full overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              {/* Button background animation */}
              <div className="absolute inset-0 hero-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Button content */}
              <span className="relative flex items-center gap-4 text-base sm:text-lg">
                Get in Touch
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </div>

          {/* About Us Section */}
          <div className="w-full lg:w-1/2 space-y-6 sm:space-y-8">
            {/* Section header with animation */}
            <div className="relative">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl  font-lobster font-bold text-white mb-2 animate-fade-in">
                Who are we?
              </h2>
              
              {/* Animated underline */}
              <div className="relative h-1 w-32 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full">
                <div className="absolute -right-2 -top-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
              </div>
            </div>

            {/* Decorative element */}
            <div className="flex items-center gap-2 opacity-75">
              <span className="text-blue-500 text-sm tracking-wider">EXPERIENCE</span>
              <span className="text-gray-500">•</span>
              <span className="text-blue-500 text-sm tracking-wider">EXCELLENCE</span>
              <span className="text-gray-500">•</span>
              <span className="text-blue-500 text-sm tracking-wider">ADVENTURE</span>
            </div>

            {/* Main content with enhanced typography */}
            <div className="space-y-6 text-gray-200 leading-relaxed">
              <p className="text-base sm:text-lg">
                <span className="text-blue-500 font-semibold">Cape Frontier Travel & Tours</span>{' '}
                transforms every city tour into an unforgettable journey. Explore iconic landmarks, 
                vibrant streets, rich history, and hidden gems, then venture into the stunning Winelands.
              </p>
              
              <div className="relative pl-6 border-l-4 border-blue-500/50 bg-white/5 p-4 rounded-r-xl">
                <p className="text-base sm:text-lg italic">
                  "Stroll through rolling vineyards, taste world-class wines, and enjoy gourmet food pairings—all while soaking in breathtaking scenery."
                </p>
              </div>
              
              <p className="text-base sm:text-lg">
                Our tours blend exploration with the elegance and flavour of the Winelands, making 
                every journey <span className="text-blue-500 font-semibold">effortless, exciting, and memorable</span>.
              </p>
            </div>

            {/* Stats or features section */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-500">10+</div>
                <div className="text-xs sm:text-sm text-gray-400">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">50+</div>
                <div className="text-xs sm:text-sm text-gray-400">Tour Packages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-500">1000+</div>
                <div className="text-xs sm:text-sm text-gray-400">Happy Clients</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AboutUs;