// START: Import React and Dongles
import { ChangeEvent, SetStateAction, useState, useEffect } from 'react';

// START: Import React Functional Components
import RangeCurrencySelector from '../RangeCurrencySelector/RangeCurrencySelector';

// START: Import Local Files
import styles from './RangeCurrencyConverter.module.css';
import { calculateSecondaryDepositQty } from '../../../../utils/functions/calculateSecondaryDepositQty';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setPrimaryQuantity } from '../../../../utils/state/tradeDataSlice';

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
    isTokenAPrimary: boolean;
    setIsTokenAPrimary: React.Dispatch<SetStateAction<boolean>>;
    isTokenABase: boolean;
    isAmbient: boolean;
    depositSkew: number;
    isReversalInProgress: boolean;
    setIsReversalInProgress: React.Dispatch<SetStateAction<boolean>>;
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
        isTokenAPrimary,
        setIsTokenAPrimary,
        isAmbient,
        depositSkew,
        isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked,
        setIsReversalInProgress,
        isReversalInProgress,
    } = props;

    // useEffect(() => {
    //     console.log({ depositSkew });
    // }, [depositSkew]);

    const dispatch = useAppDispatch();

    const [tokenAQty, setTokenAQty] = useState<number>(0);
    const [tokenBQty, setTokenBQty] = useState<number>(0);

    const setTokenAQtyValue = (value: number) => {
        setTokenAQty(value);
        if (isReversalInProgress) {
            console.log('reversing');
            const tokenBQtyField = document.getElementById('B-range-quantity') as HTMLInputElement;

            if (tokenBQtyField) {
                tokenBQtyField.value = value.toString();
                setTokenBQty(value);
            }
            return;
        }

        console.log({ isTokenABase });
        console.log({ value });
        console.log({ isAmbient });

        const qtyTokenB = calculateSecondaryDepositQty(
            poolPriceNonDisplay,
            tokenPair.dataTokenA.decimals,
            tokenPair.dataTokenB.decimals,
            value.toString(),
            true,
            isTokenABase,
            isAmbient,
            depositSkew,
        );

        console.log({ qtyTokenB });

        const tokenBQtyField = document.getElementById('B-range-quantity') as HTMLInputElement;

        if (qtyTokenB) {
            tokenBQtyField.value = typeof qtyTokenB === 'string' ? qtyTokenB : qtyTokenB.toString();
            dispatch(setPrimaryQuantity(value.toString()));
            setIsTokenAPrimary(true);
            setTokenBQty(qtyTokenB);
        } else {
            tokenBQtyField.value = '';
            dispatch(setPrimaryQuantity('0'));
            setIsTokenAPrimary(true);
            setTokenBQty(0);
        }
    };

    const setTokenBQtyValue = (value: number) => {
        setTokenBQty(value);

        if (isReversalInProgress) {
            console.log('reversing');
            const tokenAQtyField = document.getElementById('A-range-quantity') as HTMLInputElement;

            if (tokenAQtyField) {
                tokenAQtyField.value = value.toString();
                setTokenAQty(value);
            }
            return;
        }

        const qtyTokenA = calculateSecondaryDepositQty(
            poolPriceNonDisplay,
            tokenPair.dataTokenA.decimals,
            tokenPair.dataTokenB.decimals,
            value.toString(),
            false,
            isTokenABase,
            isAmbient,
            depositSkew,
        );
        console.log({ qtyTokenA });

        const tokenAQtyField = document.getElementById('A-range-quantity') as HTMLInputElement;
        if (qtyTokenA) {
            tokenAQtyField.value = typeof qtyTokenA === 'string' ? qtyTokenA : qtyTokenA.toString();
            dispatch(setPrimaryQuantity(value.toString()));
            setIsTokenAPrimary(false);
            setTokenAQty(qtyTokenA);
        } else {
            tokenAQtyField.value = '';
            dispatch(setPrimaryQuantity('0'));
            setIsTokenAPrimary(false);
            setTokenAQty(0);
        }
    };

    const handleTokenAQtyFieldUpdate = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            console.log('field A manually updated');
            setTokenAQtyValue(parseFloat(evt.target.value));
            setIsTokenAPrimary(true);
        } else {
            console.log('quanties updated based on field A');

            if (tokenAQty) setTokenAQtyValue(tokenAQty);
        }
    };

    const handleTokenBQtyFieldUpdate = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            console.log('field B manually updated');
            setTokenBQtyValue(parseFloat(evt.target.value));
            setIsTokenAPrimary(false);
        } else {
            console.log('quanties updated based on field B');
            if (tokenBQty) setTokenBQtyValue(tokenBQty);
        }
    };

    useEffect(() => {
        if (isReversalInProgress) {
            handleTokenAQtyFieldUpdate();
            handleTokenBQtyFieldUpdate();
        } else {
            console.log({ isTokenAPrimary });

            isTokenAPrimary ? handleTokenAQtyFieldUpdate() : handleTokenBQtyFieldUpdate();
        }
        setIsReversalInProgress(false);
    }, [JSON.stringify(tokenPair), poolPriceNonDisplay, depositSkew]);

    // props for <RangeCurrencyConverter/> React element
    const rangeCurrencySelectorCommonProps = {
        chainId: chainId,
        tokenPair: tokenPair,
        tokensBank: tokensBank,
        isWithdrawTokenAFromDexChecked: isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked: setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked: isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked: setIsWithdrawTokenBFromDexChecked,
        setIsReversalInProgress: setIsReversalInProgress,
    };

    return (
        <section className={styles.currency_converter}>
            <RangeCurrencySelector
                fieldId='A'
                updateOtherQuantity={handleTokenAQtyFieldUpdate}
                {...rangeCurrencySelectorCommonProps}
            />
            <div className={styles.arrow_container}>
                {isLiq ? null : <span className={styles.arrow} />}
            </div>
            <RangeCurrencySelector
                fieldId='B'
                updateOtherQuantity={handleTokenBQtyFieldUpdate}
                {...rangeCurrencySelectorCommonProps}
            />
        </section>
    );
}
