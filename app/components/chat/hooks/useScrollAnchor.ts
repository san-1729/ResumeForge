import { useRef, useEffect } from 'react';

export function useScrollAnchor<T extends HTMLElement>() {
  const anchorRef = useRef<T | null>(null);

  useEffect(() => {
    anchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  return anchorRef;
}
