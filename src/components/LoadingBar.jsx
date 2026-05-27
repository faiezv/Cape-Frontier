import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const LoadingBarContext = createContext();

export const useLoadingBar = () =>
  useContext(LoadingBarContext);

function LoadingBar({ children }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(15);

  const timers = useRef([]);

  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // INITIAL PAGE LOAD
  useEffect(() => {
    const start = setTimeout(() => {
      setProgress(60);
    }, 100);

    const finish = setTimeout(() => {
      setProgress(100);

      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }, 500);

    return () => {
      clearTimeout(start);
      clearTimeout(finish);
    };
  }, []);

  const startLoading = () => {
    clearAll();

    setVisible(true);
    setProgress(0);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setProgress(35);

        timers.current.push(
          setTimeout(() => setProgress(55), 180),
          setTimeout(() => setProgress(75), 320),
          setTimeout(() => setProgress(92), 520)
        );
      });
    });
  };

  const completeLoading = () => {
    clearAll();

    setProgress(100);

    timers.current.push(
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 350)
    );
  };

  return (
    <LoadingBarContext.Provider
      value={{
        startLoading,
        completeLoading,
      }}
    >
      {children}

      <div
        className="
          fixed top-0 left-0
          h-[3px]
          w-screen
          origin-left
          bg-yellow-400
          z-[999999]
          transition-all duration-300 ease-out
          pointer-events-none
        "
        style={{
          opacity: visible ? 1 : 0,
          transform: `scaleX(${progress / 100})`,
        }}
      />
    </LoadingBarContext.Provider>
  );
}

export default LoadingBar;
