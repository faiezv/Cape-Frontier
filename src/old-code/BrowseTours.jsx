import React from 'react'
import { useNavigate } from 'react-router-dom';

const BrowseTours = () => {


   const nav = useNavigate();
    // Example data for 9 tours
    const tours = [
        { id: 1, locations: false, group: false, price: "1,200.00",image: "/images/tours/sharkcagediving.png", info: "Shark Cage Diving", description: "Gansbaai is a small fishing town along South Africa's southwestern coast, about 160 km from Cape Town. Often called the 'Great White Shark Capital of the World,' it offers prime waters for shark cage diving. It offers a thrilling, safe, and educational encounter with great white sharks, combining adventure tourism with marine conservation and ecological awareness." },
        { id: 2, locations: false, group: false, price: "3,500.00",image: "/images/tours/gunrange.png", info: "Gun Range", description: "Step into the boots of a Cowboy, the badge of a Cop, or the precision of a skilled marksman, and experience excitement like never before. Explore our wide selection of popular brands and accessories — the perfect place to fuel your passion. ‘Bulls Eye’ you got this!!" },
        { id: 3, locations: false, group: true, price: "7,500.00",image: "/images/tours/pentour1.png", info: "Cape Peninsula Tour Package", description: "Discover the best of the Cape Peninsula in one unforgettable day. Visit Boulders Beach penguins, Cape Point, charming Simon’s Town, and enjoy breathtaking coastal views along Chapman’s Peak." },
        { id: 4, locations: false, group: true, price: "5,700.00",image: "/images/tours/pentour2.png", info: "Mother City Tour Package", description: "Discover Cape Town’s highlights with coastal drives, Chapman’s Peak, Cape Point, Boulders Beach penguins, and a relaxing visit to Kirstenbosch Botanical Gardens—all in one unforgettable day." },
        { id: 9, locations: false, group: true, price: "1,800.00",image: "/images/tours/robbenIsland.png", info: "Robben Island", description: "Robben Island is a small island off the coast of Cape Town, South Africa, historically used as a prison for political prisoners, including Nelson Mandela, and now serves as a UNESCO World Heritage Site and museum symbolizing the triumph of the human spirit over oppression." },
        { id: 6, locations: false, group: true, price: "1,800.00",image: "/images/tours/langa.png", info: "Langa Township", description: "Langa Township, meaning “sun” in isiXhosa, is Cape Town’s oldest township and a vibrant destination for experiencing South Africa’s culture, history, and community spirit." }, 
        { id: 5, locations: true, group: false, price: "1,950.00",image: "/images/tours/lionsHead.png", info: "Stellenbosch Wine Route info", description: "Travel from Cape Town to the historic town of Stellenbosch and enjoy tastings at top wine estates including Spier, Rust en Vrede, Delaire Graff, and Tokara. A relaxed day of fine wines, scenic views, and world-class estates." },
    ];
  
    const ToursGrid = () => {
        return (
        <div className="w-full max-w-5xl items-center place-self-center py-2 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row rounded-lg overflow-hidden shadow-md font-frank">
                {/* Left half - image */}
                <div className="md:w-1/2 md:h-full h-[10%] ">
                    <img src="/images/tours/book1.png"  className="object-stretch" alt="" />
                </div>
    
                {/* Right half - info */}
                <div className="md:w-1/2 bg-black text-white flex flex-col gap-4 px-4 justify-between">
                   <div className="basis-[40%] text-4xl">Experience Your Next Adventure.</div>
                   <div className="basis-[35%]">It offers a thrilling, safe, and educational encounter with great white sharks, combining adventure tourism with marine conservation and ecological awareness.</div>
                   <div className="flex basis-[25%] items-center gap-4">
                    <div className="flex-1/2 flex justify-center gap-4 p-2 items-end hero-gradient ">
                      <div className="">Explore</div>  
                    </div>
                    <div className="flex-1/2 flex items-center">
                      <img src="/icons/browseTour/destination.png" className='h-8 items-center' alt="" />
                    </div>
                   </div>
                </div>
            </div>

            
            {tours.map((tour) => (
            <div
                key={tour.id}
                className="flex flex-col md:flex-row h-70 text-white bg-black"
            >
                {/* Left half - image */}
                <div
                  className="md:w-1/2 md:h-full h-1/2 bg-cover bg-center"
                  style={{ backgroundImage: `url(${tour.image})` }}
                ></div>
    
                {/* Right half - info */}
                <div className="md:w-1/2 md:h-full h-1/2 px-4 gap-3 flex flex-col">
                    {/* 1 */}
                    <div className="basis-[10%] font-frank text-3xl">{tour.info}</div>
                    {/* 2 */}
                    <div className="basis-[25%] font-frank font-light overflow-hidden">{tour.description}</div>
                    {/* 3 */}
                    <div className="basis-[29%] flex items-end justify-start">
                      <div className="w-1/2 flex gap-2">
                        {tour.group && (
                          <>
                            <div className="basis-[20%] flex items-center justify-end">
                              <img
                                src="/icons/savemore-cropped.png"
                                className="h-[80%] opacity-50"
                                alt=""
                              />
                            </div>
                            <p className="basis-[80%] flex items-center leading-tight">
                              Save more when you <br /> book in a group!
                            </p>
                          </>
                        )}
                        {tour.locations && (
                          <>
                            <div className="basis-[20%] flex items-center justify-end">
                              <img
                                src="/icons/mapPin-cropped.png"
                                className="h-[80%] opacity-50"
                                alt=""
                              />
                            </div>
                            <p className="basis-[80%] flex items-center leading-tight">
                              Multiple pickup <br /> locations offered!
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    {/* 4 */}
                    <div className="basis-[24%] flex ">
                      <div className="flex-1 flex items-center justify-center hero-gradient m-1 rounded-4xl">
                        <div className="flex px- border-white  justify-evenly  w-full"
                        onClick={() => {
                          // nav("/booking", { state: {fromHome: true, scrollTo: "top"}})
                          nav("/booking", { state : {tour}})
                        }}>
                          <p className="items-center justify-end flex text-xl">Book Now</p>
                          <div className="">
                            <img src="/icons/browseTour/cart.png" className='h-8 object-contain' alt="" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col items-end justify-end">
                        <div className="flex-1/2 flex text-3xl font-frank">ZAR {tour.price} <span className='opacity-50 pl-2'>pp</span></div>
                        <div className="basis-[40%] flex gap-2">
                          <img src="/icons/downArrow.png" className='h-4 object-contain mt-1' alt="" />
                          <div className="">Learn more</div>
                        </div>
                      </div>
                    </div>
                </div>
            </div>
            ))}
        </div>
        );
    };
        

    return (
      <div className="w-full min-h-screen bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-lobster sm:text-4xl md:text-5xl  text-center py-4 hero-gradient text-white rounded-t-full">
            Book A Tour
          </h2>

          <div className="slider min-w-7xl mx-auto px-2 h-2 bg-blue-200 mt-2 rounded-full"></div>
  
          <div className="toursSlidePoints flex flex-wrap justify-center gap-2 sm:gap-1 md:gap-1 mt-2">
            <div className="tour-card1 bg-black text-white flex-1 min-w-[120px] sm:min-w-[150px] md:min-w-[200px] flex items-center justify-center py-2 rounded-lg hover:scale-105 transition-transform cursor-pointer">
              Half Day Tours
            </div>
            <div className="tour-card2 bg-black text-white flex-1 min-w-[120px] sm:min-w-[150px] md:min-w-[200px] flex items-center justify-center py-2 rounded-lg hover:scale-105 transition-transform cursor-pointer">
              Full Day Tours
            </div>
            <div className="tour-card3 bg-black text-white flex-1 min-w-[120px] sm:min-w-[150px] md:min-w-[200px] flex items-center justify-center py-2 rounded-lg hover:scale-105 transition-transform cursor-pointer">
              Packages
            </div>
            <div className="tour-card4 bg-black text-white flex-1 min-w-[120px] sm:min-w-[150px] md:min-w-[200px] flex items-center justify-center py-2 rounded-lg hover:scale-105 transition-transform cursor-pointer">
              Historical Places
            </div>
            <div className="tour-card5 bg-black text-white flex-1 min-w-[120px] sm:min-w-[150px] md:min-w-[200px] flex items-center justify-center py-2 rounded-lg hover:scale-105 transition-transform cursor-pointer">
              Stellenbosch Wine <br/> Route
            </div>
          </div>

        <div className="div"></div>
            <ToursGrid />
        </div>
      </div>
    )
  }
export default BrowseTours

