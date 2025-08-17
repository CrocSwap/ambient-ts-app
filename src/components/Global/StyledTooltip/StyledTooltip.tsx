import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

interface TooltipProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    title: React.ReactNode;
    children: React.ReactElement;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
    arrow?: boolean;
    style?: React.CSSProperties;
    enterDelay?: number;
    leaveDelay?: number;
    id?: string;
    disableHoverListener?: boolean;
}

const TooltipContainer = styled.div`
    display: inline-block;
    position: relative;
`;

const TooltipContent = styled.div<{ visible: boolean; placement: string }>`
    position: absolute;
    padding: 8px;
    border-radius: 4px;
    font-size: 0.875rem;
    line-height: 1.4;
    max-width: 300px;
    z-index: 9999;
    visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
    opacity: ${(props) => (props.visible ? 1 : 0)};
    transition:
        opacity 0.2s ease-in-out,
        visibility 0.2s ease-in-out;
    background-color: var(--dark2);
    color: var(--text1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

    ${({ placement }) => {
        switch (placement) {
            case 'top':
                return 'bottom: 100%; left: 50%; transform: translateX(-50%) translateY(-8px); margin-bottom: 8px;';
            case 'bottom':
                return 'top: 100%; left: 50%; transform: translateX(-50%) translateY(8px); margin-top: 8px;';
            case 'left':
                return 'top: 50%; right: 100%; transform: translateX(-8px) translateY(-50%); margin-right: 8px;';
            case 'right':
            default:
                return 'top: 50%; left: 100%; transform: translateX(8px) translateY(-50%); margin-left: 8px;';
        }
    }}
`;

const Arrow = styled.div<{ placement: string }>`
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: var(--dark2);
    z-index: -1;
    ${({ placement }) => {
        switch (placement) {
            case 'top':
                return 'bottom: -4px; left: 50%; transform: translateX(-50%) rotate(45deg);';
            case 'bottom':
                return 'top: -4px; left: 50%; transform: translateX(-50%) rotate(45deg);';
            case 'left':
                return 'top: 50%; right: -4px; transform: translateY(-50%) rotate(45deg);';
            case 'right':
            default:
                return 'top: 50%; left: -4px; transform: translateY(-50%) rotate(45deg);';
        }
    }}
`;

export const DefaultTooltip: React.FC<TooltipProps> = ({
    title,
    children,
    placement = 'top',
    className = '',
    arrow = false,
    style,
    enterDelay = 0,
    leaveDelay = 0,
    id,
    disableHoverListener = false,
    ...props
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (disableHoverListener) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (enterDelay > 0) {
            timeoutRef.current = setTimeout(() => {
                setIsVisible(true);
            }, enterDelay);
        } else {
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        if (disableHoverListener) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (leaveDelay > 0) {
            timeoutRef.current = setTimeout(() => {
                setIsVisible(false);
            }, leaveDelay);
        } else {
            setIsVisible(false);
        }
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <TooltipContainer
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={className}
            id={id}
            {...props}
        >
            {children}
            <TooltipContent
                visible={isVisible}
                placement={placement}
                style={style}
                className='tooltip-content'
            >
                {title}
                {arrow && <Arrow placement={placement} />}
            </TooltipContent>
        </TooltipContainer>
    );
};

export const TextOnlyTooltip: React.FC<TooltipProps> = (props) => (
    <DefaultTooltip
        {...props}
        leaveDelay={props.leaveDelay || 500}
        style={{
            ...props.style,
            backgroundColor: 'transparent',
            boxShadow: 'none',
        }}
    />
);

export const NoColorTooltip: React.FC<TooltipProps> = (props) => (
    <DefaultTooltip
        {...props}
        style={{
            ...props.style,
            backgroundColor: 'transparent',
            boxShadow: 'none',
        }}
    />
);

export const GreenTextTooltip: React.FC<TooltipProps> = (props) => (
    <DefaultTooltip
        {...props}
        style={{
            ...props.style,
            color: 'green',
            backgroundColor: 'transparent',
            boxShadow: 'none',
        }}
    />
);

export const RedTextTooltip: React.FC<TooltipProps> = (props) => (
    <DefaultTooltip
        {...props}
        style={{
            ...props.style,
            color: 'red',
            backgroundColor: 'transparent',
            boxShadow: 'none',
        }}
    />
);

export const FutaTooltip: React.FC<TooltipProps> = (props) => (
    <DefaultTooltip
        {...props}
        style={{
            ...props.style,
            backgroundColor: 'var(--dark2)',
            color: 'var(--text2)',
            border: '1px solid yellow',
        }}
    />
);

export default DefaultTooltip;
