import styles from './OpenOrderStatus.module.css';
import { AiOutlineCheck } from 'react-icons/ai';
import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';
interface OpenOrderStatusProps {
    isFilled: boolean;
}

export default function OpenOrderStatus(props: OpenOrderStatusProps) {
    const filledWithTooltip = (
        <DefaultTooltip
            interactive
            title={'Filled'}
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <div className={styles.filled}>
                <AiOutlineCheck color='var(--other-green)' size={15} />
            </div>
        </DefaultTooltip>
    );

    const nonFilledWithTooltip = (
        <DefaultTooltip
            title={'Not Filled'}
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <div className={styles.non_filled}></div>
        </DefaultTooltip>
    );

    return <> {props.isFilled ? filledWithTooltip : nonFilledWithTooltip}</>;
}
