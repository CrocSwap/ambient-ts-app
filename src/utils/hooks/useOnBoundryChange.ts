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
    const [boundryChecker, setBoundryChecker] = useState<
        NodeJS.Timeout | number | undefined
    >();
    const checkerRef = useRef<NodeJS.Timeout | number | undefined>(undefined);
    checkerRef.current = boundryChecker;

    const [elementWidth, setElementWidth] = useState<number>();
    const widthRef = useRef<number>(undefined);
    widthRef.current = elementWidth;
    const [elementHeight, setElementHeight] = useState<number>();
    const heightRef = useRef<number>(undefined);
    heightRef.current = elementHeight;

    const bindListener = () => {
        if (!elementId || !checkFrequency || !handler) {
            return;
        }

        // assign el, and t0 dimension props
        if (checkerRef.current) {
            return;
        }

        const el = document.getElementById(elementId);
        if (el) {
            setElementWidth(el.getBoundingClientRect().width);
            setElementHeight(el.getBoundingClientRect().height);

            if (checkerRef.current) {
                clearInterval(checkerRef.current);
            }

            // start interval
            const interval = setInterval(() => {
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
            checkerRef.current = interval;
        }
    };

    useEffect(() => {
        return () => {
            if (checkerRef.current) {
                clearInterval(checkerRef.current);
                checkerRef.current = undefined;
            }
        };
    }, []);

    useEffect(() => {
        bindListener();
    }, [elementId.length > 0]);
};
export default useOnBoundryChange;
