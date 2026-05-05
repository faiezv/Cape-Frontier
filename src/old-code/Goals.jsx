import React from "react";
import ReviewsPosts from "./ReviewsPosts";
import GoalsCards from './GoalsCards';


const Goals = () => {
  return (
    <div className="hero-gradient font-frank
    flex flex-col  text-white items-center rounded-4xl m-12 ">

        <div className="font-frank text-2xl font-bold hero-gradient-bl mt-4 flex p-2 w-1/3 justify-center rounded-full">Traveller Reviews</div>
        {/* REAL STORIES ROW */}
        <div className="flex justify-between w-full shadow-2xl py-8 g-red-400">
          <div className="flex-1 emptyFiller"></div>
          <div className="flex-1 font-frank text-center leading-28 text-9xl opacity-80">REAL STORIES</div>
          <div className="flex-1 flex items-center justify-center">
            <img src="/icons/info.png" className="md:scale-50" />
          </div>
        </div>


        {/* BADGE STRIP */}
        <div className="flex w-fit shadow-2xl p-4 py-6 mb-12 justify-center gap-24">
          <div className="flex gap-4 items-center">
            <img src="/icons/5stars.png" className="object-cover h-20" alt="" />
            <div className="flex flex-col font-bold leading-tight">
              <p className="text-4xl leading-tight">Rated 4.9/5 * from 200+ <br /> adventurers Worldwide.</p>
              <div className="opacity-70 pl-4">Trusted experience across 40+ Countries!</div>
            </div>
          </div>
          

          <div className="flex gap-4 items-center">
            <img src="/icons/worldwide.png" className="object-cover h-16" alt="" />
            <div className="flex flex-col">
              <div className="text-4xl font-bold">Worldwide Travellers.</div>
              <div className="opacity-70 pl-4">Loved by travllers from 40+ countries!</div>
            </div>
          </div>
        </div>
        {/* Reviews */}
        <ReviewsPosts />
        <GoalsCards />

    </div>
  )
}

export default Goals