import { ReactNode } from 'react';
import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';
import styles from './IconWithTooltip.module.css';

interface IconWithTooltipPropsIF {
    children: ReactNode;
    symbolTitle: string;
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
}

export default function IconWithTooltip(props: IconWithTooltipPropsIF) {
    const { children, symbolTitle, placement } = props;
    return (
        <DefaultTooltip
            title={symbolTitle}
            enterDelay={400}
            leaveDelay={200}
            placement={placement ? placement : 'bottom'}
        >
            <div>{children}</div>
        </DefaultTooltip>
    );
}
