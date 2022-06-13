// START: Import React and Dongles
import { ChangeEvent, SetStateAction, useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';

import {
    setTokenA,
    setTokenB,
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
    tokenABalance: string;
    tokenBBalance: string;
    tokenAInputQty: string;
    tokenBInputQty: string;
    setTokenAInputQty: React.Dispatch<React.SetStateAction<string>>;
    setTokenBInputQty: React.Dispatch<React.SetStateAction<string>>;
    setLimitButtonErrorMessage: React.Dispatch<React.SetStateAction<string>>;
    isWithdrawFromDexChecked: boolean;
    setIsWithdrawFromDexChecked: React.Dispatch<SetStateAction<boolean>>;
    isWithdrawToWalletChecked: boolean;
    setIsWithdrawToWalletChecked: React.Dispatch<SetStateAction<boolean>>;
}

// central react functional component
export default function LimitCurrencyConverter(props: LimitCurrencyConverterProps) {
    const {
        tokenPair,
        tokensBank,
        chainId,
        poolPriceDisplay,
        setLimitAllowed,
        isSellTokenBase,
        tokenABalance,
        tokenBBalance,
        setTokenAInputQty,
        setTokenBInputQty,
        setLimitButtonErrorMessage,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        isWithdrawToWalletChecked,
        setIsWithdrawToWalletChecked,
    } = props;

    const dispatch = useAppDispatch();

    const tradeData = useAppSelector((state) => state.tradeData);

    const [isTokenAPrimaryLocal, setIsTokenAPrimaryLocal] = useState<boolean>(
        tradeData.isTokenAPrimary,
    );
    const [tokenAQtyLocal, setTokenAQtyLocal] = useState<string>(
        isTokenAPrimaryLocal ? tradeData?.primaryQuantity : '',
    );
    const [tokenBQtyLocal, setTokenBQtyLocal] = useState<string>(
        !isTokenAPrimaryLocal ? tradeData?.primaryQuantity : '',
    );

    const tokenADecimals = tokenPair.dataTokenA.decimals;
    const tokenBDecimals = tokenPair.dataTokenB.decimals;

    // TODO: pass tokenPair to <LimitRate /> as a prop such that we can use a dynamic
    // TODO: ... logo instead of the hardcoded one it contains

    useEffect(() => {
        if (tradeData) {
            if (isTokenAPrimaryLocal) {
                setTokenAQtyLocal(tradeData.primaryQuantity);
                setTokenAInputQty(tradeData.primaryQuantity);
                const sellQtyField = document.getElementById(
                    'sell-limit-quantity',
                ) as HTMLInputElement;
                if (sellQtyField) {
                    sellQtyField.value =
                        tradeData.primaryQuantity === 'NaN' ? '' : tradeData.primaryQuantity;
                }
            } else {
                setTokenBQtyLocal(tradeData.primaryQuantity);
                setTokenBInputQty(tradeData.primaryQuantity);
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
            dispatch(setTokenA(tokenPair.dataTokenB));
            dispatch(setTokenB(tokenPair.dataTokenA));
        }
        if (!isTokenAPrimaryLocal) {
            setTokenAQtyLocal(tokenBQtyLocal);
            setTokenAInputQty(tokenBQtyLocal);
            const sellQtyField = document.getElementById('sell-limit-quantity') as HTMLInputElement;
            if (sellQtyField) {
                sellQtyField.value = tokenBQtyLocal === 'NaN' ? '' : tokenBQtyLocal;
            }
        } else {
            setTokenBQtyLocal(tokenAQtyLocal);
            setTokenBInputQty(tokenAQtyLocal);
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
    }, [poolPriceDisplay, isSellTokenBase, isTokenAPrimaryLocal, tokenABalance]);

    const handleLimitButtonMessage = (tokenAAmount: number) => {
        if (poolPriceDisplay === 0) {
            setLimitAllowed(false);
            setLimitButtonErrorMessage('Invalid Token Pair');
        } else if (tokenAAmount > parseFloat(tokenABalance)) {
            setLimitAllowed(false);
            setLimitButtonErrorMessage(
                `${tokenPair.dataTokenA.symbol} Amount Exceeds Wallet Balance`,
            );
        }
        // else if (parseInt(tokenAAllowance) < tokenAAmount) {
        //     setSwapAllowed(false);
        //     setSwapButtonErrorMessage(`${tokenPair.dataTokenA.symbol} Amount Exceeds Allowance`);
        // }
        else if (isNaN(tokenAAmount) || tokenAAmount <= 0) {
            setLimitAllowed(false);
            setLimitButtonErrorMessage('Enter an Amount');
        } else {
            setLimitAllowed(true);
        }
    };

    const handleTokenAChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        let rawTokenBQty;

        if (evt) {
            const input = evt.target.value;
            setTokenAQtyLocal(input);
            setTokenAInputQty(input);
            setIsTokenAPrimaryLocal(true);
            dispatch(setIsTokenAPrimary(true));
            dispatch(setPrimaryQuantity(input));

            rawTokenBQty = isSellTokenBase
                ? (1 / poolPriceDisplay) * parseFloat(input)
                : poolPriceDisplay * parseFloat(input);

            handleLimitButtonMessage(parseFloat(input));
        } else {
            rawTokenBQty = isSellTokenBase
                ? (1 / poolPriceDisplay) * parseFloat(tokenAQtyLocal)
                : poolPriceDisplay * parseFloat(tokenAQtyLocal);
            handleLimitButtonMessage(parseFloat(tokenAQtyLocal));
        }
        const truncatedTokenBQty = truncateDecimals(rawTokenBQty, tokenBDecimals).toString();

        setTokenBQtyLocal(truncatedTokenBQty);
        setTokenBInputQty(truncatedTokenBQty);
        const buyQtyField = document.getElementById('buy-limit-quantity') as HTMLInputElement;

        if (buyQtyField) {
            buyQtyField.value = truncatedTokenBQty === 'NaN' ? '' : truncatedTokenBQty;
        }
    };
    const handleTokenBChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        let rawTokenAQty;

        if (evt) {
            const input = evt.target.value;
            setTokenBQtyLocal(input);
            setTokenBInputQty(input);
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
        handleLimitButtonMessage(rawTokenAQty);
        const truncatedTokenAQty = truncateDecimals(rawTokenAQty, tokenADecimals).toString();
        setTokenAQtyLocal(truncatedTokenAQty);
        setTokenAInputQty(truncatedTokenAQty);
        const sellQtyField = document.getElementById('sell-limit-quantity') as HTMLInputElement;
        if (sellQtyField) {
            sellQtyField.value = truncatedTokenAQty === 'NaN' ? '' : truncatedTokenAQty;
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
                tokenABalance={tokenABalance}
                tokenBBalance={tokenBBalance}
                isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                isWithdrawToWalletChecked={isWithdrawToWalletChecked}
                setIsWithdrawToWalletChecked={setIsWithdrawToWalletChecked}
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
                tokenABalance={tokenABalance}
                tokenBBalance={tokenBBalance}
                isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                isWithdrawToWalletChecked={isWithdrawToWalletChecked}
                setIsWithdrawToWalletChecked={setIsWithdrawToWalletChecked}
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
