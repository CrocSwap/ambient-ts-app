import { useEffect, useRef, useState } from 'react';

export type Event = MouseEvent | TouchEvent;

interface ElementBoundry {
    width: number;
    height: number;
}

const useOnBoundryChange = (
    elementId: string,
    checkFrequency: number,
    handler: (newBoundries: ElementBoundry) => void,
) => {
    const [boundryChecker, setBoundryChecker] = useState<NodeJS.Timer>();
    const checkerRef = useRef<NodeJS.Timer>();
    checkerRef.current = boundryChecker;

    const [elementWidth, setElementWidth] = useState<number>();
    const widthRef = useRef<number>();
    widthRef.current = elementWidth;
    const [elementHeight, setElementHeight] = useState<number>();
    const heightRef = useRef<number>();
    heightRef.current = elementHeight;

    useEffect(() => {
        // assign el, and t0 dimension props
        const el = document.getElementById(elementId);
        if (el) {
            setElementWidth(el.getBoundingClientRect().width);
            setElementHeight(el.getBoundingClientRect().height);

            // start interval
            const interval = setInterval(() => {
                if (checkerRef.current) {
                    clearInterval(checkerRef.current);
                }
                const newWidth = el.getBoundingClientRect().width;
                const newHeight = el.getBoundingClientRect().height;
                if (
                    newWidth !== widthRef.current ||
                    newHeight !== heightRef.current
                ) {
                    handler({ width: newWidth, height: newHeight });
                }
                setElementWidth(newWidth);
                setElementHeight(newHeight);
            }, checkFrequency);

            setBoundryChecker(interval);
        }

        return () => {
            if (checkerRef.current) {
                clearInterval(checkerRef.current);
            }
        };
    }, []);
};
export default useOnBoundryChange;
