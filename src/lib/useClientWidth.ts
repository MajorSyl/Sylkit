import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';

// Screen width that is safe on pre-rendered pages. The static build has no screen, so the first
// render reports 0 (phone layout). After the page loads we re-render with the real width, which
// makes the browser apply the correct layout instead of keeping the pre-rendered one.
export function useClientWidth() {
  const { width } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? width : 0;
}
