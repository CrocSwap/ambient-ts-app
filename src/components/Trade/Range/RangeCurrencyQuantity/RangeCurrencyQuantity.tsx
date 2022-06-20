import { ChangeEvent } from 'react';
import styles from './RangeCurrencyQuantity.module.css';
import { GoCircleSlash } from 'react-icons/go';

interface RangeCurrencyQuantityProps {
    disable?: boolean;
    fieldId: string;
    updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
    isAdvancedMode: boolean;
}
export default function RangeCurrencyQuantity(props: RangeCurrencyQuantityProps) {
    const { disable, updateOtherQuantity, fieldId, isAdvancedMode } = props;
    // console.log({ disable });

    const disabledContent = (
        <div className={styles.overlay_container}>
            <GoCircleSlash size={15} />
            <div className={styles.disabled_text}>
                The market is outside your specified range.
                <div className={styles.warning_text}>Single-asset deposit only.</div>
            </div>
        </div>
    );

    return (
        <div className={styles.token_amount}>
            {isAdvancedMode && disable && disabledContent}

            <input
                id={`${fieldId}-range-quantity`}
                className={styles.currency_quantity}
                placeholder='0.0'
                onChange={(e) => updateOtherQuantity(e)}
                type='string'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern='^[0-9]*[.,]?[0-9]*$'
                disabled={disable}
                required
            />
        </div>
    );
}
