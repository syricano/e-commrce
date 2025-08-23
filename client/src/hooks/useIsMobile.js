import { useEffect, useState } from 'react';
export default function useIsMobile(maxWidth = 1024) {
  const get = () => (typeof window !== 'undefined' ? window.innerWidth <= maxWidth : false);
  const [isMobile, setIsMobile] = useState(get);
  useEffect(() => { const onResize = () => setIsMobile(get()); window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize); }, [maxWidth]);
  return isMobile;
}
