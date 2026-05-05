import React, { useEffect, useState } from 'react'

/////////////// PAGES ////////////////////////////
import ScrollToTop from './components/ScrollToTop.jsx';
import Navbar from './components/Navbar.jsx'
import AnimatedRoutes from './components/AnimatedRoutes.jsx';
import Lenis from 'lenis'


const App = () => {

  useEffect(() => {
    const lenis = new Lenis({
      stopInertiaOnNavigate: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.lenis = lenis; // make global
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className='min-w-full bg-red-900 relative'>

      <ScrollToTop />
      <Navbar className=''></Navbar>
      <AnimatedRoutes />

    </div>
  )
}

export default App
