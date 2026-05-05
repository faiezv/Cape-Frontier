import React from 'react'

const Foot = () => {
  return (
    <>
    <div className="flex h-screen bg-black text-white">
      <div className="basis-[90%] flex flex-col z-1 p-8">

        <div className="basis-[95%] flex">

          <div className="w-1/2 flex flex-col justify-between p-4">
            {/* Have a question? */}
            <div className="">
              <div className="text-6xl font-frank">Have a Question?</div>
              <p className="font-frank max-w-md">Have a question? Reach out to us anytime — we’re here to help you plan the perfect Cape Peninsula experience.</p>
            </div>

            {/* Icons, Contact and FaqChat */}
            <div className="flex flex-col items-start p-12">
             <div className="flex flex-col gap-2 scale-120">
                <div className="flex gap-2 text-lg justify-center">
                  <img className="object-contain h-6" src="/icons/landing/whatsapp.png" alt="" />
                  <img className="object-contain h-6" src="/icons/landing/gmail.png" alt="" />
                  <img className="object-contain h-6" src="/icons/landing/instagram.png" alt="" />
                </div>
                <button className="px-20 py-1 rounded-full bg-linear-to-r from-purple-500 to-green-400 hover:opacity-90 transition">
                  Contact Us
                </button>
              </div>
              
              <div className="items-center justify-center flex scale-120">
                <img src="/icons/faqChat.png" className='object-contain scale-90' alt="" />
              </div>
            </div>
          </div>


          <div className="w-1/2 flex flex-col justify-end items-center ">
            <div className="w-2/3 flex scale-100 ">
             <img src="/assets/logoSlogan.png" className='object-auto h-fit' alt="" />
            </div>
            <div className="w-full flex h-1/3 gap-4 m-20">
              <div className="flex-1 hero-gradient-bl opacity-50 hover:opacity-100 transition flex justify-center items-center rounded-4xl">Half Day Tours</div>
              <div className="flex-1 hero-gradient-bl opacity-50 hover:opacity-100 transition flex justify-center items-center rounded-4xl">Full Day Tours</div>
              <div className="flex-1 hero-gradient-bl opacity-50 hover:opacity-100 transition flex justify-center items-center rounded-4xl">Packages</div>
            </div>
          </div>
        </div>


        <div className="basis-[5%] flex items-center justify-center mx-12 border px-4 py-2 rounded-xl">
          <p className="w-1/2"> <b>(c) Cape Frontier 2025.</b> All Rights Reserved. </p>
          <div className="w-1/2 flex items-end justify-end gap-8">
            <div className="">Contact Us</div>
            <div className="">Privacy Policy</div>
            <div className="">Terms & Conditions</div>
          </div>
        </div>
      </div>

      {/* Up Arrow */}
      <div className="basis-[10%] p-10 z-2">
        <div 
          className="h-16 border rounded-xl items-center justify-center flex cursor-pointer"
          onClick={() => {
            // If Lenis is available globally
            if (window.lenis) {
              window.lenis.scrollTo(0, { duration: 2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
            } else {
              // Fallback to regular scroll
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
        >
          <img src="/icons/upArrow.png" className='h-8' alt="" />
        </div>  
      </div>
    </div>
    <div className="h-112 hero-gradient-bl w-full absolute bottom-40 left-0 z-0"></div>
    </>
  )
}

export default Foot