import React from 'react'

const BadgeStrip = () => {
  return (
    <div className="flex justify-evenly -translate-y-16 place-self-center w-full max-w-7xl bg-black border-white">
  
        <div className="flex items-center justify-center">
            <img 
            src="icons/badges/badge1.png" 
            alt="Badge 1"
            className="sm:w-[90%] md:w-[80%] lg:w-[80%] h-ato"
            />
        </div>

        <div className="flex items-center justify-center mt-[8%]">
            <img  
            src="icons/badges/badge2.png"  
            alt="Badge 2" 
            className="sm:w-[140%] md:w-[120%] lg:w-[90%] h-aut"
            /> 
        </div> 
 
        <div className="flex items-center justify-center">
            <img 
            src="icons/badges/badge3.png" 
            alt="Badge 3"
            className="sm:w-[90%] md:w-[80%] lg:w-[80%] h-auo"
            />
        </div>

    </div>  
  )
}

export default BadgeStrip