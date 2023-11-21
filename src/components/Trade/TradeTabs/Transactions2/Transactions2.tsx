import { useEffect, useRef } from 'react';

export default function Transactions2() {
    const containerRef = useRef<HTMLOListElement>(null);

    useEffect(() => {
        function logWidth() {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                console.log(containerWidth);
            }
        }

        const resizeObserver: ResizeObserver = new ResizeObserver(logWidth);
        containerRef.current && resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return <ol ref={containerRef}>The new Tranactions tab!</ol>;
}
