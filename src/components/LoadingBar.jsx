import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const LoadingBarContext = createContext({
  startLoading: () => {},
  completeLoading: () => {},
});

export const useLoadingBar = () => useContext(LoadingBarContext);

function LoadingBar({ children }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(15);

  const timers = useRef([]);
  const rafs = useRef([]);
  const manualRun = useRef(false); // true once a child calls startLoading()

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    rafs.current.forEach(cancelAnimationFrame);
    rafs.current = [];
  }, []);

  const startLoading = useCallback(() => {
    manualRun.current = true;
    clearAll();

    setVisible(true);
    setProgress(0);

    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => {
        setProgress(35);
        timers.current.push(
          setTimeout(() => setProgress(55), 180),
          setTimeout(() => setProgress(75), 320),
          setTimeout(() => setProgress(92), 520)
        );
      });
      rafs.current.push(r2);
    });
    rafs.current.push(r1);
  }, [clearAll]);

  const completeLoading = useCallback(() => {
    clearAll();
    setProgress(100);

    timers.current.push(
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 350)
    );
  }, [clearAll]);

  // INITIAL PAGE LOAD (skipped if a child already took control)
  useEffect(() => {
    manualRun.current = false;

    timers.current.push(
      setTimeout(() => {
        if (!manualRun.current) setProgress(60);
      }, 100),
      setTimeout(() => {
        if (manualRun.current) return;
        setProgress(100);
        timers.current.push(
          setTimeout(() => {
            if (manualRun.current) return;
            setVisible(false);
            setProgress(0);
          }, 300)
        );
      }, 500)
    );

    return clearAll;
  }, [clearAll]);

  const value = useMemo(
    () => ({ startLoading, completeLoading }),
    [startLoading, completeLoading]
  );

  return (
    <LoadingBarContext.Provider value={value}>
      {children}

      <div
        className="fixed top-0 left-0 h-[3px] w-screen origin-left bg-yellow-400 z-[999999] transition-all duration-300 ease-out pointer-events-none"
        style={{
          opacity: visible ? 1 : 0,
          transform: `scaleX(${progress / 100})`,
        }}
      />
    </LoadingBarContext.Provider>
  );
}

export default LoadingBar;