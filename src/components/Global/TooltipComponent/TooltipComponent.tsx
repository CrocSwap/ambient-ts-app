import styles from './TooltipComponent.module.css';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';

interface TooltipComponentProps {
    title: string;

    icon?: JSX.Element;
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

export default function TooltipComponent(props: TooltipComponentProps) {
    return (
        <DefaultTooltip
            title={props.title}
            interactive
            placement={props.placement ? props.placement : 'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <div className={styles.icon}>
                {props.icon ? props.icon : <AiOutlineQuestionCircle size={15} />}
            </div>
        </DefaultTooltip>
    );
}
