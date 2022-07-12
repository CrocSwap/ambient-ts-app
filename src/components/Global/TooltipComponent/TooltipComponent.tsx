import styles from './TooltipComponent.module.css';
import { Tooltip } from '@mui/material';
import { AiOutlineQuestionCircle } from 'react-icons/ai';

interface TooltipComponentProps {
    title: string;
    content?: JSX.Element;
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
    const svgIcon = (
        <div className={styles.icon}>
            <AiOutlineQuestionCircle size={15} />
        </div>
    );

    return (
        <Tooltip
            title={props.title}
            placement={props.placement ? props.placement : 'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            {props.content ? props.content : svgIcon}
        </Tooltip>
    );
}
