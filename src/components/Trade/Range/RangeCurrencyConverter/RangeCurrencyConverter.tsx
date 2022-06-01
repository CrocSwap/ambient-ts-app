import { ChangeEvent, SetStateAction } from 'react';
import styles from './RangeCurrencyConverter.module.css';
import RangeCurrencySelector from '../RangeCurrencySelector/RangeCurrencySelector';
import { calculateSecondaryDepositQty } from '../../../../utils/functions/calculateSecondaryDepositQty';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setIsTokenAPrimary, setPrimQty } from '../../../../utils/state/rangeDataSlice';

interface RangeCurrencyConverterProps {
    isLiq?: boolean;
    poolPriceNonDisplay: number;
    tokenPair: {
        dataTokenA: TokenIF;
        dataTokenB: TokenIF;
    };
    isTokenABase: boolean;
    depositSkew: number;
    setIsSellTokenPrimary?: React.Dispatch<SetStateAction<boolean>>;
}

export default function RangeCurrencyConverter(
    props: RangeCurrencyConverterProps,
): React.ReactElement<RangeCurrencyConverterProps> {
    const { isLiq, poolPriceNonDisplay, tokenPair, isTokenABase, depositSkew } = props;

    const dispatch = useAppDispatch();

    const handleChangeQtyTokenA = (evt: ChangeEvent<HTMLInputElement>) => {
        const qtyTokenB = calculateSecondaryDepositQty(
            poolPriceNonDisplay,
            tokenPair.dataTokenA.decimals,
            tokenPair.dataTokenB.decimals,
            evt.target.value,
            true,
            isTokenABase,
            false,
            depositSkew,
        )?.toString();
        const fieldToUpdate = document.getElementById('buy-range-quantity') as HTMLInputElement;
        fieldToUpdate.value = typeof qtyTokenB === 'string' ? qtyTokenB : '';
        dispatch(setPrimQty(evt.target.value));
        dispatch(setIsTokenAPrimary(true));
    };

    const handleChangeQtyTokenB = (evt: ChangeEvent<HTMLInputElement>) => {
        const qtyTokenA = calculateSecondaryDepositQty(
            poolPriceNonDisplay,
            tokenPair.dataTokenA.decimals,
            tokenPair.dataTokenB.decimals,
            evt.target.value,
            false,
            isTokenABase,
            false,
            depositSkew,
        )?.toString();
        const fieldToUpdate = document.getElementById('sell-range-quantity') as HTMLInputElement;
        fieldToUpdate.value = typeof qtyTokenA === 'string' ? qtyTokenA : '';
        dispatch(setPrimQty(evt.target.value));
        dispatch(setIsTokenAPrimary(false));
    };

    return (
        <section className={styles.currency_converter}>
            <RangeCurrencySelector
                fieldId='sell'
                updateOtherQuantity={handleChangeQtyTokenA}
                sellToken
            />
            <div className={styles.arrow_container}>
                {isLiq ? null : <span className={styles.arrow} />}
            </div>
            <RangeCurrencySelector fieldId='buy' updateOtherQuantity={handleChangeQtyTokenB} />
        </section>
    );
}
