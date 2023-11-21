import { useEffect, useRef } from 'react';

export default function Transactions2() {
    const containerRef = useRef<HTMLOListElement>(null);

    // add an observer to watch for element to be re-sized
    // later this should go to the parent so every table tab has it available
    useEffect(() => {
        // fn to log the width of the element in the DOM (number of pixels)
        function logWidth() {
            // make sure element exists
            if (containerRef.current) {
                // log the width of the DOM element
                const containerWidth = containerRef.current.clientWidth;
                console.log(containerWidth);
            }
        }

        // create an observer holding the width-logging function
        const resizeObserver: ResizeObserver = new ResizeObserver(logWidth);
        containerRef.current && resizeObserver.observe(containerRef.current);

        // cleanup the observer from the DOM when component dismounts
        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return <ol ref={containerRef}>The new Tranactions tab!</ol>;
}
