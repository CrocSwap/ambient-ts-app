import { ReactNode } from 'react';
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

    style?: any;
}

export default function IconWithTooltip(props: IconWithTooltipPropsIF) {
    const { children, title, placement, style } = props;
    return (
        <DefaultTooltip
            interactive
            arrow
            title={title}
            enterDelay={400}
            leaveDelay={200}
            placement={placement ? placement : 'bottom'}
        >
            <div style={style}>{children}</div>
        </DefaultTooltip>
    );
}
