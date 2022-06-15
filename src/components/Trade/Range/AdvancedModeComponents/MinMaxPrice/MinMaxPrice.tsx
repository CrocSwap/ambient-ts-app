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
}

export default function MinMaxPrice(props: IMinMaxPrice) {
    const {
        minPricePercentage,
        maxPricePercentage,
        setMinPriceInputString,
        setMaxPriceInputString,
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
    return (
        <div className={styles.min_max_container}>
            <PriceInput
                fieldId='min'
                title='Min Price'
                percentageDifference={minPricePercentage}
                handleChangeEvent={handleMinPriceChangeEvent}
            />
            <PriceInput
                fieldId='max'
                title='Max Price'
                percentageDifference={maxPricePercentage}
                handleChangeEvent={handleMaxPriceChangeEvent}
            />
        </div>
    );
}
