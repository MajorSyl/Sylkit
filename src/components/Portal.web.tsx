import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Renders children straight into <body>, outside every page wrapper. A `position: fixed` element
// only pins to the screen if no parent has a transform, filter or backdrop-filter, so anything
// that must stay on screen (like the checkout bar) goes through here.
// Waits until after mount, because the static pre-render has no document.
export function Portal({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.body), []);
  return host ? createPortal(children, host) : null;
}
