import React from 'react';
import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';

interface IconWithTooltipProps {
    children: React.ReactNode;
    title: React.ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    style?: React.CSSProperties;
    enterDelay?: number;
    arrow?: boolean;
    className?: string;
    id?: string;
    disableHoverListener?: boolean;
}

function IconWithTooltip({
    children,
    title,
    placement = 'bottom',
    style,
    enterDelay = 400,
    arrow = true,
    className,
    id,
    disableHoverListener,
}: IconWithTooltipProps) {
    return (
        <DefaultTooltip
            title={title}
            placement={placement}
            style={style}
            enterDelay={enterDelay}
            arrow={arrow}
            className={className}
            id={id}
            disableHoverListener={disableHoverListener}
        >
            <div style={{ display: 'inline-flex' }}>{children}</div>
        </DefaultTooltip>
    );
}

export default React.memo(IconWithTooltip);
