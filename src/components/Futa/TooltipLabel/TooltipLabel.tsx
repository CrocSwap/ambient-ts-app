import TooltipComponent from '../../Global/TooltipComponent/TooltipComponent';
import styles from './TooltipLabel.module.css';
// Tooltip Label Component

interface propsIF {
    itemTitle: string;
    tooltipTitle: string;
    isHeader?: boolean;
    fontSize?: number | `${string}px`;
}
const TooltipLabel = (props: propsIF) => {
    const { itemTitle, tooltipTitle, isHeader, fontSize } = props;

    // decision tree to determine font size
    let fontSizeToConsume: string;
    if (fontSize) {
        fontSizeToConsume =
            typeof fontSize === 'number'
                ? fontSize.toString() + 'px'
                : fontSize;
    } else if (isHeader) {
        fontSizeToConsume = '24px';
    } else {
        fontSizeToConsume = '14px';
    }

    return (
        <div className={styles.tooltipLabelContainer}>
            <p
                className={styles.tickerLabel}
                style={{
                    color: isHeader ? 'var(--text1)' : 'var(--text2)',
                    fontSize: fontSizeToConsume,
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
