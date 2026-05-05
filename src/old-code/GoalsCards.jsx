import React from 'react'
import Tooltip from './Tooltip';

function GoalsCards() {
  return (
    <>

 {/* // Other trustworthy reviews  */}
 <div className="flex max-w-7xl justify-around items-stretch w-full h-full px-2 gap-16 ">


{/* left card */}
<div className="flex basis-[50%] ">

  <div className="flex-1/5 flex-col w-full flex items-stretch justify-between">
    <img  
            src="images/trustcard1.png"  
            alt="Badge 2" 
            className="sm:w-[67%] md:w-[80%] lg:w-[60%]"
    /> 
  </div>

  <div className="flex-4/5 flex-col w-full flex justify-end">

    <div className="flex-1 flex">
      <p className="flex-1/2 text-6xl sm:text-4xl">Trust and <br /> Confidence</p>

      <Tooltip text="tooltup test" className="flex-1/2 flex items-start justify-end">
        <img className="sm:w-[20%] md:w-[20%] lg:w-[90%]" src="/icons/info.png" alt="" />
      </Tooltip>
    </div>  
    {/* 25% */}

    <div className="flex-1 "></div> 
    {/* 50% */}

    <div className="flex-1">
      Book tours and activities in one place with direct messaging, secure and flexible payment options, booking protection, 24/7 customer support, and additional perks. We’ve got your back!  
    </div>   
    {/* 25% */}

  </div>

</div>


{/* right card */}
<div className="basis-[50%] flex flex-col w-full">
  <div className="flex-1 flex">
    <p className="flex-1/2 text-6xl sm:text-4xl">Trust and <br /> Confidence</p>
    <div className="flex-1/2 flex items-start justify-end">
      <img className="sm:w-[15%] md:w-[10%] lg:w-[13%]" src="/icons/info.png" alt="" />
    </div>
  </div>  {/* 25% */}
  <div className="flex-2 py-4 flex items-end">
    <img className="sm:w-[50%] md:w-[40%] lg:w-[28%]" src="/images/trustcard2.png" alt="" />
  </div>   {/* 50% */}
  <div className="flex-1 pr-4">
     Book tours and activities in one place with direct messaging, secure and flexible payment options, booking protection, 24/7 customer support, and additional perks. We’ve got your back!  
  </div>   {/* 25% */}
</div>
</div>

    </>
  )
}

export default GoalsCards