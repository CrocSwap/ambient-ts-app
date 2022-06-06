// START: Import React and Dongles
import { ChangeEvent, SetStateAction } from 'react';

// START: Import React Functional Components
import RangeCurrencySelector from '../RangeCurrencySelector/RangeCurrencySelector';

// START: Import Local Files
import styles from './RangeCurrencyConverter.module.css';
import { calculateSecondaryDepositQty } from '../../../../utils/functions/calculateSecondaryDepositQty';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setIsTokenAPrimary, setPrimaryQuantity } from '../../../../utils/state/tradeDataSlice';

// interface for component props
interface RangeCurrencyConverterPropsIF {
    tokensBank: Array<TokenIF>;
    chainId: string;
    isWithdrawTokenAFromDexChecked: boolean;
    setIsWithdrawTokenAFromDexChecked: React.Dispatch<SetStateAction<boolean>>;
    isWithdrawTokenBFromDexChecked: boolean;
    setIsWithdrawTokenBFromDexChecked: React.Dispatch<SetStateAction<boolean>>;
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

// central React functional component
export default function RangeCurrencyConverter(props: RangeCurrencyConverterPropsIF) {
    const {
        chainId,
        isLiq,
        tokensBank,
        poolPriceNonDisplay,
        tokenPair,
        isTokenABase,
        depositSkew,
        isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked,
    } = props;

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
        const fieldToUpdate = document.getElementById('B-range-quantity') as HTMLInputElement;
        fieldToUpdate.value = typeof qtyTokenB === 'string' ? qtyTokenB : '';
        dispatch(setPrimaryQuantity(evt.target.value));
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
        const fieldToUpdate = document.getElementById('A-range-quantity') as HTMLInputElement;
        fieldToUpdate.value = typeof qtyTokenA === 'string' ? qtyTokenA : '';
        dispatch(setPrimaryQuantity(evt.target.value));
        dispatch(setIsTokenAPrimary(false));
    };

    // props for <RangeCurrencyConverter/> React element
    const rangeCurrencySelectorCommonProps = {
        chainId: chainId,
        tokenPair: tokenPair,
        tokensBank: tokensBank,
        isWithdrawTokenAFromDexChecked: isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked: setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked: isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked: setIsWithdrawTokenBFromDexChecked,
    };

    return (
        <section className={styles.currency_converter}>
            <RangeCurrencySelector
                fieldId='A'
                updateOtherQuantity={handleChangeQtyTokenA}
                {...rangeCurrencySelectorCommonProps}
            />
            <div className={styles.arrow_container}>
                {isLiq ? null : <span className={styles.arrow} />}
            </div>
            <RangeCurrencySelector
                fieldId='B'
                updateOtherQuantity={handleChangeQtyTokenB}
                {...rangeCurrencySelectorCommonProps}
            />
        </section>
    );
}
