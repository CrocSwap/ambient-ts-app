import { useEffect, RefObject } from 'react';

export type Event = MouseEvent | TouchEvent;

const useInsideClick = <T extends HTMLElement = HTMLElement>(
    ref: RefObject<T>,
    handler: (event: Event) => void,
) => {
    useEffect(() => {
        const listener = (event: Event) => {
            const el = ref?.current;
            if (el && el.contains((event?.target as Node) || null)) {
                // Call the handler only if the click is inside of the element passed.
                handler(event);
            }
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]); // Reload only if ref or handler changes
};

export default useInsideClick;
