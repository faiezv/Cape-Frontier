// useScrollLock.js
import { useEffect } from 'react';

const useScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = {
      html: document.documentElement.style.overflow,
      body: document.body.style.overflow,
    };
    const originalPadding = document.body.style.paddingRight;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.documentElement.style.overflow = originalOverflow.html;
      document.body.style.overflow = originalOverflow.body;
      document.body.style.paddingRight = originalPadding;
    };
  }, [locked]);
};

export default useScrollLock;