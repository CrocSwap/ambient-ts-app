import TooltipComponent from '../../Global/TooltipComponent/TooltipComponent';
import styles from './TooltipLabel.module.css';
// Tooltip Label Component
interface TooltipTitleProps {
    itemTitle: string;
    tooltipTitle: string;
    isHeader?: boolean;
}
const TooltipLabel = (props: TooltipTitleProps) => {
    const { itemTitle, tooltipTitle, isHeader } = props;
    return (
        <div className={styles.tooltipLabelContainer}>
            <p
                className={styles.tickerLabel}
                style={{
                    color: isHeader ? 'var(--text1)' : 'var(--text2)',
                    fontSize: isHeader ? '24px' : '14px',
                }}
            >
                {itemTitle}
            </p>
            <TooltipComponent
                placement='bottom'
                noBg
                title={
                    <div className={styles.tooltipTitleDisplay}>
                        {tooltipTitle}
                    </div>
                }
            />
        </div>
    );
};

export default TooltipLabel;
