import { useState, useEffect, useRef } from 'react';

// eslint-disable-next-line
export default function useHover<T>(): [any, boolean] {
    const [value, setValue] = useState<boolean>(false);
    // eslint-disable-next-line
    const ref: any = useRef<T | null>(null);
    const handleMouseOver = (): void => setValue(true);
    const handleMouseOut = (): void => setValue(false);
    useEffect(
        () => {
            // eslint-disable-next-line
            const node: any = ref.current;
            if (node) {
                node.addEventListener('mouseover', handleMouseOver);
                node.addEventListener('mouseout', handleMouseOut);
                return () => {
                    node.removeEventListener('mouseover', handleMouseOver);
                    node.removeEventListener('mouseout', handleMouseOut);
                };
            }
        },
        [ref.current], // Recall only if ref changes
    );
    return [ref, value];
}
