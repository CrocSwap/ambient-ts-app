import React, { useEffect, useRef, useState } from 'react';
import styles from './Tooltip.module.css';

const isTouchDevice = () => {
    if (typeof window === 'undefined') return false;
    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
    );
};

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
    maxWidth?: string;
}

const Tooltip = ({
    content,
    children,
    position = 'top',
    className = '',
    maxWidth = '200px',
}: TooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const isTouch = isTouchDevice();

    const calculatePosition = () => {
        if (!tooltipRef.current || !triggerRef.current) return {};

        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const triggerRect = triggerRef.current.getBoundingClientRect();

        let top = 0;
        let left = 0;

        switch (position) {
            case 'top':
                left = -(tooltipRect.width - triggerRect.width) / 2;
                top = -tooltipRect.height - 8;
                break;
            case 'bottom':
                left = -(tooltipRect.width - triggerRect.width) / 2;
                top = triggerRect.height + 8;
                break;
            case 'left':
                left = -tooltipRect.width - 8;
                top = -(tooltipRect.height - triggerRect.height) / 2;
                break;
            case 'right':
                left = triggerRect.width + 8;
                top = -(tooltipRect.height - triggerRect.height) / 2;
                break;
        }

        // Check if tooltip would go off screen
        const viewportPadding = 10;
        const tooltipLeft = triggerRect.left + left;
        const tooltipTop = triggerRect.top + top;

        if (tooltipLeft < viewportPadding) {
            left = left + (viewportPadding - tooltipLeft);
        } else if (
            tooltipLeft + tooltipRect.width >
            window.innerWidth - viewportPadding
        ) {
            left =
                left -
                (tooltipLeft +
                    tooltipRect.width -
                    window.innerWidth +
                    viewportPadding);
        }

        if (tooltipTop < viewportPadding) {
            top = triggerRect.height + 8; // Switch to bottom if would go off top
        } else if (
            tooltipTop + tooltipRect.height >
            window.innerHeight - viewportPadding
        ) {
            top = -tooltipRect.height - 8; // Switch to top if would go off bottom
        }

        return { top, left };
    };

    useEffect(() => {
        let rafId: number;

        if (isVisible) {
            const updatePosition = () => {
                const position = calculatePosition();
                if (tooltipRef.current) {
                    tooltipRef.current.style.top = `${position.top}px`;
                    tooltipRef.current.style.left = `${position.left}px`;
                }
                rafId = requestAnimationFrame(updatePosition);
            };

            rafId = requestAnimationFrame(updatePosition);

            return () => {
                if (rafId) cancelAnimationFrame(rafId);
            };
        }
    }, [isVisible, position]);

    const [isManuallyClosed, setIsManuallyClosed] = useState(false);
    const hideTimeoutRef = useRef<NodeJS.Timeout>();
    const isHovering = useRef(false);
    const tooltipHovering = useRef(false);

    const handleTrigger = (show: boolean) => {
        if (show) {
            if (isManuallyClosed) return;

            // Clear any pending hide operations
            clearTimeout(hideTimeoutRef.current);
            isHovering.current = true;

            // Show the tooltip immediately on hover
            setIsVisible(true);
        } else {
            isHovering.current = false;

            // Only hide if not hovering over tooltip
            if (!tooltipHovering.current) {
                hideTimeoutRef.current = setTimeout(() => {
                    if (!isTouch && !isManuallyClosed && !isHovering.current) {
                        setIsVisible(false);
                    }
                }, 300);
            }
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isTouch) {
            setIsVisible(!isVisible);
        } else {
            // On desktop, clicking will keep the tooltip open
            setIsManuallyClosed(false);
            setIsVisible(true);
        }
    };

    // Close tooltip when clicking outside
    useEffect(() => {
        if (!isVisible || isTouch) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                tooltipRef.current &&
                !tooltipRef.current.contains(e.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node)
            ) {
                setIsVisible(false);
                setIsManuallyClosed(true);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            clearTimeout(hideTimeoutRef.current);
        };
    }, [isVisible, isTouch]);

    const handleTooltipMouseEnter = () => {
        clearTimeout(hideTimeoutRef.current);
        console.log('entering');
        tooltipHovering.current = true;
        if (!isTouch) {
            setIsVisible(true);
        }
    };

    const handleTooltipMouseLeave = () => {
        tooltipHovering.current = false;
        console.log('leaving');
        if (!isTouch && !isManuallyClosed) {
            hideTimeoutRef.current = setTimeout(() => {
                if (!isHovering.current) {
                    console.log('hiding');
                    setIsVisible(false);
                }
            }, 1500);
        }
    };

    return (
        <div
            className={`${styles.tooltipWrapper} ${className}`}
            ref={triggerRef}
            onMouseEnter={() => handleTrigger(true)}
            onMouseLeave={() => handleTrigger(false)}
            onClick={handleClick}
        >
            <div className={styles.tooltipTrigger}>{children}</div>

            {isVisible && content && (
                <div
                    ref={tooltipRef}
                    style={{ maxWidth }}
                    className={`${styles.tooltip} ${
                        isTouch ? styles.mobileTooltip : ''
                    }`}
                    onMouseEnter={handleTooltipMouseEnter}
                    onMouseLeave={handleTooltipMouseLeave}
                    onClick={(e) => e.stopPropagation()}
                >
                    {content}
                </div>
            )}
        </div>
    );
};

export default Tooltip;
