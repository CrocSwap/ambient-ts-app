// START: Import React and Dongles
import { ChangeEvent, SetStateAction, useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';

import {
    setAddressTokenA,
    setAddressTokenB,
    setIsTokenAPrimary,
    setPrimaryQuantity,
} from '../../../../utils/state/tradeDataSlice';

import truncateDecimals from '../../../../utils/data/truncateDecimals';

// START: Import React Functional Components
import LimitCurrencySelector from '../LimitCurrencySelector/LimitCurrencySelector';
import LimitRate from '../LimitRate/LimitRate';

// START: Import Local Files
import styles from './LimitCurrencyConverter.module.css';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';

// interface for component props
interface LimitCurrencyConverterProps {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    chainId: string;
    poolPriceDisplay: number;
    setIsSellTokenPrimary?: React.Dispatch<SetStateAction<boolean>>;
    setLimitAllowed: React.Dispatch<React.SetStateAction<boolean>>;
    isSellTokenBase: boolean;
}

// central react functional component
export default function LimitCurrencyConverter(props: LimitCurrencyConverterProps) {
    const { tokenPair, tokensBank, chainId, poolPriceDisplay, setLimitAllowed, isSellTokenBase } =
        props;

    const dispatch = useAppDispatch();

    const tradeData = useAppSelector((state) => state.tradeData);

    const [isTokenAPrimaryLocal, setIsTokenAPrimaryLocal] = useState<boolean>(
        tradeData.isTokenAPrimary,
    );
    const [tokenAQtyLocal, setTokenAQtyLocal] = useState<string>('');
    const [tokenBQtyLocal, setTokenBQtyLocal] = useState<string>('');

    const tokenADecimals = tokenPair.dataTokenA.decimals;
    const tokenBDecimals = tokenPair.dataTokenB.decimals;

    // TODO: pass tokenPair to <LimitRate /> as a prop such that we can use a dynamic
    // TODO: ... logo instead of the hardcoded one it contains

    useEffect(() => {
        if (tradeData) {
            if (isTokenAPrimaryLocal) {
                setTokenAQtyLocal(tradeData.primaryQuantity);
                const sellQtyField = document.getElementById(
                    'sell-limit-quantity',
                ) as HTMLInputElement;
                if (sellQtyField) {
                    sellQtyField.value =
                        tradeData.primaryQuantity === 'NaN' ? '' : tradeData.primaryQuantity;
                }
            } else {
                setTokenBQtyLocal(tradeData.primaryQuantity);
                const buyQtyField = document.getElementById(
                    'buy-limit-quantity',
                ) as HTMLInputElement;
                if (buyQtyField) {
                    buyQtyField.value =
                        tradeData.primaryQuantity === 'NaN' ? '' : tradeData.primaryQuantity;
                }
            }
        }
    }, []);

    const handleArrowClick = (): void => {
        reverseTokens();
    };

    const reverseTokens = (): void => {
        if (tokenPair) {
            dispatch(setAddressTokenA(tokenPair.dataTokenB.address));
            dispatch(setAddressTokenB(tokenPair.dataTokenA.address));
        }
        if (!isTokenAPrimaryLocal) {
            setTokenAQtyLocal(tokenBQtyLocal);
            const sellQtyField = document.getElementById('sell-limit-quantity') as HTMLInputElement;
            if (sellQtyField) {
                sellQtyField.value = tokenBQtyLocal === 'NaN' ? '' : tokenBQtyLocal;
            }
        } else {
            setTokenBQtyLocal(tokenAQtyLocal);
            const buyQtyField = document.getElementById('buy-limit-quantity') as HTMLInputElement;
            if (buyQtyField) {
                buyQtyField.value = tokenAQtyLocal === 'NaN' ? '' : tokenAQtyLocal;
            }
        }
        setIsTokenAPrimaryLocal(!isTokenAPrimaryLocal);
        dispatch(setIsTokenAPrimary(!isTokenAPrimaryLocal));
    };

    useEffect(() => {
        isTokenAPrimaryLocal ? handleTokenAChangeEvent() : handleTokenBChangeEvent();
    }, [poolPriceDisplay, isSellTokenBase, isTokenAPrimaryLocal]);

    const handleTokenAChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        let rawTokenBQty;

        if (evt) {
            const input = evt.target.value;
            setTokenAQtyLocal(input);
            setIsTokenAPrimaryLocal(true);
            dispatch(setIsTokenAPrimary(true));
            dispatch(setPrimaryQuantity(input));

            rawTokenBQty = isSellTokenBase
                ? (1 / poolPriceDisplay) * parseFloat(input)
                : poolPriceDisplay * parseFloat(input);
        } else {
            rawTokenBQty = isSellTokenBase
                ? (1 / poolPriceDisplay) * parseFloat(tokenAQtyLocal)
                : poolPriceDisplay * parseFloat(tokenAQtyLocal);
        }
        const truncatedTokenBQty = truncateDecimals(rawTokenBQty, tokenBDecimals).toString();

        setTokenBQtyLocal(truncatedTokenBQty);
        const buyQtyField = document.getElementById('buy-limit-quantity') as HTMLInputElement;

        if (buyQtyField) {
            buyQtyField.value = truncatedTokenBQty === 'NaN' ? '' : truncatedTokenBQty;
        }
        if (truncatedTokenBQty !== 'NaN' && parseFloat(truncatedTokenBQty) > 0) {
            setLimitAllowed(true);
        } else {
            setLimitAllowed(false);
        }
    };
    const handleTokenBChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        let rawTokenAQty;

        if (evt) {
            const input = evt.target.value;
            setTokenBQtyLocal(input);
            setIsTokenAPrimaryLocal(false);
            dispatch(setIsTokenAPrimary(false));
            dispatch(setPrimaryQuantity(input));

            rawTokenAQty = isSellTokenBase
                ? poolPriceDisplay * parseFloat(input)
                : (1 / poolPriceDisplay) * parseFloat(input);
        } else {
            rawTokenAQty = isSellTokenBase
                ? poolPriceDisplay * parseFloat(tokenBQtyLocal)
                : (1 / poolPriceDisplay) * parseFloat(tokenBQtyLocal);
        }

        const truncatedTokenAQty = truncateDecimals(rawTokenAQty, tokenADecimals).toString();

        setTokenAQtyLocal(truncatedTokenAQty);
        const sellQtyField = document.getElementById('sell-limit-quantity') as HTMLInputElement;
        if (sellQtyField) {
            sellQtyField.value = truncatedTokenAQty === 'NaN' ? '' : truncatedTokenAQty;
        }
        if (truncatedTokenAQty !== 'NaN' && parseFloat(truncatedTokenAQty) > 0) {
            setLimitAllowed(true);
        } else {
            setLimitAllowed(false);
        }
    };

    return (
        <section className={styles.currency_converter}>
            <LimitCurrencySelector
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                chainId={chainId}
                fieldId='sell'
                sellToken
                direction='From: '
                handleChangeEvent={handleTokenAChangeEvent}
                reverseTokens={reverseTokens}
            />
            <div className={styles.arrow_container} onClick={handleArrowClick}>
                <span className={styles.arrow} />
            </div>
            <LimitCurrencySelector
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                chainId={chainId}
                fieldId='buy'
                direction='To: '
                handleChangeEvent={handleTokenBChangeEvent}
                reverseTokens={reverseTokens}
            />
            <LimitRate
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                chainId={chainId}
                fieldId='limit-rate'
                reverseTokens={reverseTokens}
            />
        </section>
    );
}
