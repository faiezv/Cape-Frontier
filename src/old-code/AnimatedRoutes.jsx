import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "../pages/Home";
import Booking from "../pages/Booking";
import Book from "../components/Book.jsx"
import Checkout from "../pages/Checkout";
import CheckoutSuccess from "../pages/CheckoutSuccess";
import PageNotFound from "../pages/PageNotFound";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const PageWrapper = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.2, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/book" element={<Book />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/success" element={<CheckoutSuccess />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default AnimatedRoutes;