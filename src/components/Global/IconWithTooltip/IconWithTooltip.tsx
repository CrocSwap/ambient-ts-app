import { memo, ReactNode } from 'react';
import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';

interface IconWithTooltipPropsIF {
    children: ReactNode;
    title: string;
    placement?:
        | 'right'
        | 'bottom-end'
        | 'bottom-start'
        | 'bottom'
        | 'left-end'
        | 'left-start'
        | 'left'
        | 'right-end'
        | 'right-start'
        | 'top-end'
        | 'top-start'
        | 'top'
        | undefined;
    // eslint-disable-next-line
    style?: any;
    enterDelay?: string;
}

function IconWithTooltip(props: IconWithTooltipPropsIF) {
    const { children, title, placement, style, enterDelay } = props;
    return (
        <DefaultTooltip
            interactive
            arrow
            title={title}
            enterDelay={enterDelay ? parseFloat(enterDelay) : 400}
            leaveDelay={200}
            placement={placement ? placement : 'bottom'}
        >
            <div style={style}>{children}</div>
        </DefaultTooltip>
    );
}

export default memo(IconWithTooltip);
