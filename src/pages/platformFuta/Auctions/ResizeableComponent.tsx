import React from 'react';
import { NumberSize, Resizable } from 're-resizable';
import { Direction } from 're-resizable/lib/resizer';
import styles from './Auctions.module.css';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

type ResizableContainerProps = {
    children: React.ReactNode;
    tableParentRef: React.RefObject<HTMLElement>;
    searchableTickerHeights: {
        current: number;
        min: number;
        max: number;
    };
    setSearchableTickerHeight: (height: number) => void;
    setIsSearchableTickerHeightMinimum: (isMin: boolean) => void;
    enableResize?: boolean;
};

export default function ResizableComponent({
    children,
    tableParentRef,
    searchableTickerHeights,
    setSearchableTickerHeight,
    setIsSearchableTickerHeightMinimum,
    enableResize = true,
}: ResizableContainerProps) {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isTabletScreen = useMediaQuery(
        '(min-width: 769px) and (max-width: 1024px)',
    );

    const isAccount = false;

    const isParentHeightApplicable = !isMobile || isTabletScreen;
    const isAccountHeightApplicable = isAccount && tableParentRef.current;
    const parentHeight = tableParentRef.current
        ? tableParentRef.current.getBoundingClientRect().height * 0.99
        : 0;

    const calculatedHeight = isParentHeightApplicable
        ? isAccountHeightApplicable
            ? parentHeight
            : searchableTickerHeights.current
        : '90%';

    return (
        <Resizable
            enable={{
                bottom: enableResize,
                top: false,
                left: false,
                topLeft: false,
                bottomLeft: false,
                right: false,
                topRight: false,
                bottomRight: false,
            }}
            size={{
                height: isMobile ? 'calc(100vh - 100px)' : calculatedHeight,
            }}
            minHeight={200}
            maxHeight={
                isAccount || (isMobile && !isTabletScreen)
                    ? undefined
                    : window.innerHeight - 200
            }
            onResize={(
                evt: MouseEvent | TouchEvent,
                dir: Direction,
                ref: HTMLElement,
                d: NumberSize,
            ) => {
                const newHeight = searchableTickerHeights.current + d.height;
                if (newHeight <= searchableTickerHeights.min) {
                    setIsSearchableTickerHeightMinimum(true);
                } else {
                    setIsSearchableTickerHeightMinimum(false);
                }
            }}
            onResizeStart={() => {
                /* may be useful later */
            }}
            onResizeStop={(
                evt: MouseEvent | TouchEvent,
                dir: Direction,
                ref: HTMLElement,
                d: NumberSize,
            ) => {
                const newHeight = Math.max(
                    searchableTickerHeights.min,
                    Math.min(
                        searchableTickerHeights.current + d.height,
                        searchableTickerHeights.max,
                    ),
                );

                setSearchableTickerHeight(newHeight);
            }}
            bounds={'parent'}
            className={styles.resizable}
            style={{ borderBottom: 'none !important' }}
        >
            {children}
        </Resizable>
    );
}
