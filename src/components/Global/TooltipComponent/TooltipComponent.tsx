import styles from './TooltipComponent.module.css';
import { Tooltip } from '@mui/material';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { useStyles } from '../../../utils/functions/styles';

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
    const classes = useStyles();
    return (
        <Tooltip
            title={props.title}
            placement={props.placement ? props.placement : 'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
            classes={{
                tooltip: classes.customTooltip,
            }}
        >
            <div className={styles.icon}>
                {props.icon ? props.icon : <AiOutlineQuestionCircle size={15} />}
            </div>
        </Tooltip>
    );
}
