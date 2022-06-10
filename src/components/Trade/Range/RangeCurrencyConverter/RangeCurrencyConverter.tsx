// START: Import React and Dongles
import { ChangeEvent, SetStateAction, useState, useEffect } from 'react';

// START: Import React Functional Components
import RangeCurrencySelector from '../RangeCurrencySelector/RangeCurrencySelector';

// START: Import Local Files
import styles from './RangeCurrencyConverter.module.css';
import { calculateSecondaryDepositQty } from '../../../../utils/functions/calculateSecondaryDepositQty';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import {
    setIsTokenAPrimaryRange,
    setPrimaryQuantityRange,
} from '../../../../utils/state/tradeDataSlice';

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
    // isTokenAPrimaryLocal: boolean;
    // setIsTokenAPrimaryLocal: React.Dispatch<SetStateAction<boolean>>;
    isTokenABase: boolean;
    isAmbient: boolean;
    depositSkew: number;
    setIsSellTokenPrimary?: React.Dispatch<SetStateAction<boolean>>;
    truncatedTokenABalance: string;
    truncatedTokenBBalance: string;
    setTokenAInputQty: React.Dispatch<React.SetStateAction<string>>;
    setTokenBInputQty: React.Dispatch<React.SetStateAction<string>>;
    setRangeButtonErrorMessage: React.Dispatch<React.SetStateAction<string>>;
    setRangeAllowed: React.Dispatch<SetStateAction<boolean>>;
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
        // isTokenAPrimaryLocal,
        // setIsTokenAPrimaryLocal,
        isAmbient,
        depositSkew,
        isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked,
        truncatedTokenABalance,
        truncatedTokenBBalance,
        setTokenAInputQty,
        setTokenBInputQty,
        setRangeButtonErrorMessage,
        setRangeAllowed,
    } = props;

    const dispatch = useAppDispatch();

    const [tokenAQtyLocal, setTokenAQtyLocal] = useState<number>(0);
    const [tokenBQtyLocal, setTokenBQtyLocal] = useState<number>(0);

    const tradeData = useAppSelector((state) => state.tradeData);
    const [isTokenAPrimaryLocal, setIsTokenAPrimaryLocal] = useState<boolean>(
        tradeData.isTokenAPrimaryRange,
    );

    useEffect(() => {
        if (tradeData) {
            if (tradeData.isTokenAPrimaryRange) {
                setTokenAQtyLocal(parseFloat(tradeData.primaryQuantityRange));
                setTokenAInputQty(tradeData.primaryQuantityRange);
                const sellQtyField = document.getElementById(
                    'A-range-quantity',
                ) as HTMLInputElement;
                if (sellQtyField) {
                    sellQtyField.value =
                        tradeData.primaryQuantityRange === 'NaN'
                            ? ''
                            : tradeData.primaryQuantityRange;
                }
            } else {
                setTokenBQtyLocal(parseFloat(tradeData.primaryQuantityRange));
                setTokenBInputQty(tradeData.primaryQuantityRange);
                const buyQtyField = document.getElementById('B-range-quantity') as HTMLInputElement;
                if (buyQtyField) {
                    buyQtyField.value =
                        tradeData.primaryQuantityRange === 'NaN'
                            ? ''
                            : tradeData.primaryQuantityRange;
                }
            }
        }
    }, []);

    const setTokenAQtyValue = (value: number) => {
        setTokenAQtyLocal(value);
        setTokenAInputQty(value.toString());
        handleRangeButtonMessageTokenA(value);

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

        const tokenBQtyField = document.getElementById('B-range-quantity') as HTMLInputElement;

        if (qtyTokenB) {
            tokenBQtyField.value = typeof qtyTokenB === 'string' ? qtyTokenB : qtyTokenB.toString();
            dispatch(setPrimaryQuantityRange(value.toString()));
            setIsTokenAPrimaryLocal(true);
            setTokenBQtyLocal(qtyTokenB);
            setTokenBInputQty(qtyTokenB.toString());
        } else {
            tokenBQtyField.value = '';
            dispatch(setPrimaryQuantityRange('0'));
            setIsTokenAPrimaryLocal(true);
            setTokenBQtyLocal(0);
            setTokenBInputQty('0');
        }
    };

    const setTokenBQtyValue = (value: number) => {
        setTokenBQtyLocal(value);
        handleRangeButtonMessageTokenB(value);

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

        const tokenAQtyField = document.getElementById('A-range-quantity') as HTMLInputElement;
        if (qtyTokenA) {
            tokenAQtyField.value = typeof qtyTokenA === 'string' ? qtyTokenA : qtyTokenA.toString();
            dispatch(setPrimaryQuantityRange(value.toString()));
            setIsTokenAPrimaryLocal(false);
            setTokenAQtyLocal(qtyTokenA);
            setTokenAInputQty(qtyTokenA.toString());
        } else {
            tokenAQtyField.value = '';
            dispatch(setPrimaryQuantityRange('0'));
            setIsTokenAPrimaryLocal(false);
            setTokenAQtyLocal(0);
            setTokenAInputQty('0');
        }
    };

    const reverseTokens = (): void => {
        if (!isTokenAPrimaryLocal) {
            setTokenAQtyValue(tokenBQtyLocal);

            const tokenAField = document.getElementById('A-range-quantity') as HTMLInputElement;
            if (tokenAField) {
                tokenAField.value = isNaN(tokenBQtyLocal) ? '' : tokenBQtyLocal.toString();
            }
        } else {
            setTokenBQtyValue(tokenAQtyLocal);
            const tokenBField = document.getElementById('B-range-quantity') as HTMLInputElement;
            if (tokenBField) {
                tokenBField.value = isNaN(tokenAQtyLocal) ? '' : tokenAQtyLocal.toString();
            }
        }

        setIsTokenAPrimaryLocal(!isTokenAPrimaryLocal);
        dispatch(setIsTokenAPrimaryRange(!isTokenAPrimaryLocal));
    };

    const handleRangeButtonMessageTokenA = (tokenAAmount: number) => {
        if (poolPriceNonDisplay === 0) {
            setRangeAllowed(false);
            setRangeButtonErrorMessage('Invalid Token Pair');
        } else if (tokenAAmount > parseFloat(truncatedTokenABalance)) {
            setRangeAllowed(false);
            setRangeButtonErrorMessage(
                `${tokenPair.dataTokenA.symbol} Amount Exceeds Wallet Balance`,
            );
        } else if (isNaN(tokenAAmount) || tokenAAmount <= 0) {
            setRangeAllowed(false);
            setRangeButtonErrorMessage('Enter an Amount');
        } else {
            setRangeAllowed(true);
        }
    };

    const handleRangeButtonMessageTokenB = (tokenBAmount: number) => {
        if (poolPriceNonDisplay === 0) {
            setRangeAllowed(false);
            setRangeButtonErrorMessage('Invalid Token Pair');
        } else if (tokenBAmount > parseFloat(truncatedTokenBBalance)) {
            setRangeAllowed(false);
            setRangeButtonErrorMessage(
                `${tokenPair.dataTokenB.symbol} Amount Exceeds Wallet Balance`,
            );
        } else if (isNaN(tokenBAmount) || tokenBAmount <= 0) {
            setRangeAllowed(false);
            setRangeButtonErrorMessage('Enter an Amount');
        } else {
            setRangeAllowed(true);
        }
    };

    const handleTokenAQtyFieldUpdate = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const input = evt.target.value;
            setTokenAQtyValue(parseFloat(input));
            setIsTokenAPrimaryLocal(true);
            dispatch(setIsTokenAPrimaryRange(true));
            dispatch(setPrimaryQuantityRange(input));
        } else {
            if (tokenAQtyLocal) setTokenAQtyValue(tokenAQtyLocal);
        }
    };

    const handleTokenBQtyFieldUpdate = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const input = evt.target.value;
            setTokenBQtyValue(parseFloat(input));
            setIsTokenAPrimaryLocal(false);
            dispatch(setIsTokenAPrimaryRange(false));
            dispatch(setPrimaryQuantityRange(input));
        } else {
            if (tokenBQtyLocal) setTokenBQtyValue(tokenBQtyLocal);
        }
    };

    useEffect(() => {
        isTokenAPrimaryLocal ? handleTokenAQtyFieldUpdate() : handleTokenBQtyFieldUpdate();
        // }
    }, [
        poolPriceNonDisplay,
        depositSkew,
        isTokenAPrimaryLocal,
        truncatedTokenABalance,
        truncatedTokenBBalance,
        tokenPair,
    ]);

    // props for <RangeCurrencyConverter/> React element
    const rangeCurrencySelectorCommonProps = {
        chainId: chainId,
        tokenPair: tokenPair,
        tokensBank: tokensBank,
        isWithdrawTokenAFromDexChecked: isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked: setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked: isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked: setIsWithdrawTokenBFromDexChecked,
        reverseTokens: reverseTokens,
        truncatedTokenABalance: truncatedTokenABalance,
        truncatedTokenBBalance: truncatedTokenBBalance,
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
