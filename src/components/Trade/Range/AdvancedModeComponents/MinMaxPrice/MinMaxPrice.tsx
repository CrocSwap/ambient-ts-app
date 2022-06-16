import styles from './MinMaxPrice.module.css';
import PriceInput from '../PriceInput/PriceInput';
import { ChangeEvent } from 'react';

interface IMinMaxPrice {
    minPricePercentage: number;
    maxPricePercentage: number;
    minPriceInputString: string;
    maxPriceInputString: string;
    setMinPriceInputString: React.Dispatch<React.SetStateAction<string>>;
    setMaxPriceInputString: React.Dispatch<React.SetStateAction<string>>;
    disabled?: boolean;
    isDenomBase: boolean;
    // highBoundOnFocus: () => void;
    lowBoundOnBlur: () => void;
    highBoundOnBlur: () => void;
}

export default function MinMaxPrice(props: IMinMaxPrice) {
    const {
        minPricePercentage,
        maxPricePercentage,
        setMinPriceInputString,
        setMaxPriceInputString,
        isDenomBase,
        // highBoundOnFocus,
        lowBoundOnBlur,
        highBoundOnBlur,
    } = props;

    const handleMinPriceChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const minPriceInput = evt.target.value;
            setMinPriceInputString(minPriceInput);
        } else {
            console.log('no event');
        }

        //   const buyQtyField = document.getElementById('buy-limit-quantity') as HTMLInputElement;

        //   if (buyQtyField) {
        //       buyQtyField.value = truncatedTokenBQty === 'NaN' ? '' : truncatedTokenBQty;
        //   }
    };
    const handleMaxPriceChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const maxPriceInput = evt.target.value;
            setMaxPriceInputString(maxPriceInput);
        } else {
            console.log('no event');
        }

        //   const buyQtyField = document.getElementById('buy-limit-quantity') as HTMLInputElement;

        //   if (buyQtyField) {
        //       buyQtyField.value = truncatedTokenBQty === 'NaN' ? '' : truncatedTokenBQty;
        //   }
    };

    const disableInputContent = (
        <div className={styles.disable_text}>
            Invalid range selected. The min price must be lower than the max price.
        </div>
    );
    return (
        <div className={styles.min_max_container}>
            <div className={styles.min_max_content}>
                <PriceInput
                    fieldId='min'
                    title='Min Price'
                    percentageDifference={minPricePercentage}
                    handleChangeEvent={
                        !isDenomBase ? handleMaxPriceChangeEvent : handleMinPriceChangeEvent
                    }
                    // onFocus={highBoundOnFocus}
                    onBlur={lowBoundOnBlur}
                />
                <PriceInput
                    fieldId='max'
                    title='Max Price'
                    percentageDifference={maxPricePercentage}
                    handleChangeEvent={
                        !isDenomBase ? handleMinPriceChangeEvent : handleMaxPriceChangeEvent
                    }
                    // onFocus={highBoundOnFocus}
                    onBlur={highBoundOnBlur}
                />
            </div>
            {props.disabled && disableInputContent}
        </div>
    );
}
