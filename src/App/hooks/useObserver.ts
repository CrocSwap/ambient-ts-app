import { RefObject, useEffect, useRef, useState } from 'react';

export type useObserverT<T extends HTMLElement> = [number | null, RefObject<T>];

export const useObserver = <T extends HTMLElement = HTMLElement>(): useObserverT<T> => {
    // value to track width, initializes on null, no value available until after first render
    const [width, setWidth] = useState<number|null>(null);

    // ref to attach to the desired DOM element
    const elementRef = useRef<T>(null);

    // logic to add observer to the desired DOM element
    useEffect(() => {
        const element: T|null = elementRef.current;
        if (!element) {
            setWidth(null);
            return;
        }
    
        const resizeObserver: ResizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.contentRect) {
                    setWidth(entry.contentRect.width);
                }
            }
        });
    
        resizeObserver.observe(element);
    
        // cleanup on component unmount
        return () => resizeObserver.disconnect();
    }, []);

    return [width, elementRef];
}