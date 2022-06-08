import { ChangeEvent, SetStateAction, useEffect, useState } from 'react';
import styles from './CurrencyConverter.module.css';
import CurrencySelector from '../CurrencySelector/CurrencySelector';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import { setTokenA, setTokenB } from '../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import truncateDecimals from '../../../utils/data/truncateDecimals';

interface CurrencyConverterPropsIF {
    isSellTokenBase: boolean;
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    chainId: string;
    isLiq: boolean;
    poolPriceDisplay: number;
    isSellTokenPrimary: boolean;
    setIsSellTokenPrimary: React.Dispatch<SetStateAction<boolean>>;
    nativeBalance: string;
    tokenABalance: string;
    tokenBBalance: string;
    isWithdrawFromDexChecked: boolean;
    setIsWithdrawFromDexChecked: React.Dispatch<SetStateAction<boolean>>;
    isWithdrawToWalletChecked: boolean;
    setIsWithdrawToWalletChecked: React.Dispatch<SetStateAction<boolean>>;
    setSwapAllowed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CurrencyConverter(props: CurrencyConverterPropsIF) {
    const {
        tokenPair,
        isSellTokenBase,
        tokensBank,
        chainId,
        isLiq,
        poolPriceDisplay,
        isSellTokenPrimary,
        setIsSellTokenPrimary,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        isWithdrawToWalletChecked,
        setIsWithdrawToWalletChecked,
        setSwapAllowed,
        tokenABalance,
        tokenBBalance,
    } = props;
    // TODO: update name of functions with 'handle' verbiage
    // TODO: consolidate functions into a single function
    // TODO: refactor functions to consider which token is base

    const tokenADecimals = tokenPair.dataTokenA.decimals;
    const tokenBDecimals = tokenPair.dataTokenB.decimals;

    const [sellTokenQty, setSellTokenQty] = useState<number>(0);
    const [buyTokenQty, setBuyTokenQty] = useState<number>(0);

    const setBuyQtyValue = (value: number) => {
        if (isReversalInProgress) {
            const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;

            if (buyQtyField) {
                buyQtyField.value = value.toString();
                setBuyTokenQty(value);
            }
            return;
        }
        const output = isSellTokenBase ? (1 / poolPriceDisplay) * value : poolPriceDisplay * value;

        const truncatedOutput = truncateDecimals(output, tokenBDecimals);
        const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;
        setIsSellTokenPrimary(true);
        if (buyQtyField) {
            buyQtyField.value = isNaN(truncatedOutput) ? '' : truncatedOutput.toString();
        }
        setBuyTokenQty(truncatedOutput);
        setSellTokenQty(value);
        if (!isNaN(truncatedOutput) && truncatedOutput > 0) {
            setSwapAllowed(true);
        } else {
            setSwapAllowed(false);
        }
    };

    const [isReversalInProgress, setIsReversalInProgress] = useState<boolean>(false);

    const setSellQtyValue = (value: number) => {
        if (isReversalInProgress) {
            const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;

            if (sellQtyField) {
                sellQtyField.value = value.toString();
                setSellTokenQty(value);
            }
            return;
        }

        const output = isSellTokenBase ? poolPriceDisplay * value : (1 / poolPriceDisplay) * value;
        const truncatedOutput = truncateDecimals(output, tokenADecimals);

        const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;
        setIsSellTokenPrimary(false);
        if (sellQtyField) {
            sellQtyField.value = isNaN(truncatedOutput) ? '' : truncatedOutput.toString();
        }
        setSellTokenQty(truncatedOutput);
        setBuyTokenQty(value);

        if (!isNaN(truncatedOutput) && truncatedOutput > 0) {
            setSwapAllowed(true);
        } else {
            setSwapAllowed(false);
        }
    };

    const updateBuyQty = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const input = parseFloat(evt.target.value);
            setBuyQtyValue(input);
        } else {
            if (sellTokenQty) {
                setBuyQtyValue(sellTokenQty);
            }
        }
    };

    const updateSellQty = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const input = parseFloat(evt.target.value);
            setSellQtyValue(input);
        } else {
            if (buyTokenQty) {
                setSellQtyValue(buyTokenQty);
            }
        }
    };

    const dispatch = useAppDispatch();

    const handleArrowClick = (): void => {
        setIsReversalInProgress(true);

        if (tokenPair) {
            dispatch(setTokenA(tokenPair.dataTokenB));
            dispatch(setTokenB(tokenPair.dataTokenA));
        }
    };

    useEffect(() => {
        if (isReversalInProgress) {
            updateBuyQty();
            updateSellQty();
        } else {
            isSellTokenPrimary ? updateBuyQty() : updateSellQty();
        }
        setIsReversalInProgress(false);
    }, [JSON.stringify(tokenPair), poolPriceDisplay]);

    return (
        <section className={styles.currency_converter}>
            <CurrencySelector
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                chainId={chainId}
                direction={isLiq ? 'Select Pair' : 'From:'}
                fieldId='sell'
                sellToken
                updateOtherQuantity={updateBuyQty}
                nativeBalance={props.nativeBalance}
                tokenABalance={tokenABalance}
                tokenBBalance={tokenBBalance}
                isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                isWithdrawToWalletChecked={isWithdrawToWalletChecked}
                setIsWithdrawToWalletChecked={setIsWithdrawToWalletChecked}
                setIsReversalInProgress={setIsReversalInProgress}
            />
            <div className={styles.arrow_container} onClick={handleArrowClick}>
                {isLiq ? null : <span className={styles.arrow} />}
            </div>
            <CurrencySelector
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                chainId={chainId}
                direction={isLiq ? '' : 'To:'}
                fieldId='buy'
                updateOtherQuantity={updateSellQty}
                nativeBalance={props.nativeBalance}
                tokenABalance={tokenABalance}
                tokenBBalance={tokenBBalance}
                isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                isWithdrawToWalletChecked={isWithdrawToWalletChecked}
                setIsReversalInProgress={setIsReversalInProgress}
                setIsWithdrawToWalletChecked={setIsWithdrawToWalletChecked}
            />
        </section>
    );
}
