import { ReactNode } from 'react';

// Native: no DOM, so render in place. Callers put this at the root of the screen.
// The web version (Portal.web.tsx) moves children into <body>.
export function Portal({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
