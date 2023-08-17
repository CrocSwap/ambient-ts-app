import styles from './OpenOrderStatus.module.css';
import { AiOutlineCheck } from 'react-icons/ai';
import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';
import CircularProgressBar from './CircularProgressBar';
interface OpenOrderStatusProps {
    isFilled: boolean;
    isLimitOrderPartiallyFilled: boolean;
    fillPercentage: number;
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
        <>
            <DefaultTooltip
                title={'Not Yet Filled'}
                placement={'right'}
                arrow
                enterDelay={400}
                leaveDelay={200}
            >
                <div className={styles.non_filled}></div>
            </DefaultTooltip>
        </>
    );

    let content;

    switch (true) {
        case props.isFilled:
            content = filledWithTooltip;
            break;
        case props.isLimitOrderPartiallyFilled:
            content = (
                <CircularProgressBar
                    fillPercentage={Math.round(props.fillPercentage)}
                />
            );
            break;
        default:
            content = nonFilledWithTooltip;
            break;
    }

    return <>{content}</>;
}
