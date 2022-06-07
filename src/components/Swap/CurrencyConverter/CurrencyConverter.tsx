import { ChangeEvent, SetStateAction, useEffect } from 'react';
import styles from './CurrencyConverter.module.css';
import CurrencySelector from '../CurrencySelector/CurrencySelector';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import { setAddressTokenA, setAddressTokenB } from '../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import truncateDecimals from '../../../utils/data/truncateDecimals';

interface CurrencyConverterPropsIF {
    isSellTokenBase: boolean;
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    chainId: string;
    isLiq: boolean;
    poolPriceDisplay: number;
    isTokenAPrimary: boolean;
    setIsTokenAPrimary: React.Dispatch<SetStateAction<boolean>>;
    nativeBalance: string;
    tokenABalance: string;
    tokenBBalance: string;
    tokenAInputQty: string;
    tokenBInputQty: string;
    setTokenAInputQty: React.Dispatch<React.SetStateAction<string>>;
    setTokenBInputQty: React.Dispatch<React.SetStateAction<string>>;
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
        isTokenAPrimary,
        setIsTokenAPrimary,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        isWithdrawToWalletChecked,
        setIsWithdrawToWalletChecked,
        setSwapAllowed,
        tokenABalance,
        tokenBBalance,
        setTokenAInputQty,
        setTokenBInputQty,
        tokenAInputQty,
        tokenBInputQty,
    } = props;

    // TODO: update name of functions with 'handle' verbiage
    // TODO: consolidate functions into a single function
    // TODO: refactor functions to consider which token is base

    const dispatch = useAppDispatch();

    const tokenADecimals = tokenPair.dataTokenA.decimals;
    const tokenBDecimals = tokenPair.dataTokenB.decimals;

    const handleArrowClick = (): void => {
        reverseTokens();
    };

    const reverseTokens = (): void => {
        console.log({ isTokenAPrimary });

        if (tokenPair) {
            dispatch(setAddressTokenA(tokenPair.dataTokenB.address));
            dispatch(setAddressTokenB(tokenPair.dataTokenA.address));
        }
        setTokenAInputQty(tokenBInputQty);
        const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;
        if (sellQtyField) {
            sellQtyField.value = tokenBInputQty === 'NaN' ? '' : tokenBInputQty;
        }
        setIsTokenAPrimary(!isTokenAPrimary);
    };

    useEffect(() => {
        handleTokenAChangeEvent();
    }, [poolPriceDisplay, isSellTokenBase]);

    const handleTokenAChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        let rawTokenBQty;

        if (evt) {
            const input = evt.target.value;
            console.log({ input });
            setTokenAInputQty(input);
            setIsTokenAPrimary(true);

            rawTokenBQty = isSellTokenBase
                ? (1 / poolPriceDisplay) * parseFloat(input)
                : poolPriceDisplay * parseFloat(input);
        } else {
            console.log({ tokenAInputQty });

            rawTokenBQty = isSellTokenBase
                ? (1 / poolPriceDisplay) * parseFloat(tokenAInputQty)
                : poolPriceDisplay * parseFloat(tokenAInputQty);
        }
        const truncatedTokenBQty = truncateDecimals(rawTokenBQty, tokenBDecimals).toString();

        console.log({ truncatedTokenBQty });

        setTokenBInputQty(truncatedTokenBQty);
        const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;
        if (buyQtyField) {
            buyQtyField.value = truncatedTokenBQty === 'NaN' ? '' : truncatedTokenBQty;
        }
        if (truncatedTokenBQty !== 'NaN' && parseFloat(truncatedTokenBQty) > 0) {
            setSwapAllowed(true);
        } else {
            setSwapAllowed(false);
        }
    };
    const handleTokenBChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        let rawTokenAQty;

        if (evt) {
            const input = evt.target.value;
            setTokenBInputQty(input);
            setIsTokenAPrimary(false);

            rawTokenAQty = isSellTokenBase
                ? poolPriceDisplay * parseFloat(input)
                : (1 / poolPriceDisplay) * parseFloat(input);
        } else {
            console.log({ tokenBInputQty });
            rawTokenAQty = isSellTokenBase
                ? poolPriceDisplay * parseFloat(tokenBInputQty)
                : (1 / poolPriceDisplay) * parseFloat(tokenBInputQty);
        }

        const truncatedTokenAQty = truncateDecimals(rawTokenAQty, tokenADecimals).toString();

        console.log({ truncatedTokenAQty });

        setTokenAInputQty(truncatedTokenAQty);
        const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;
        if (sellQtyField) {
            sellQtyField.value = truncatedTokenAQty === 'NaN' ? '' : truncatedTokenAQty;
        }
        if (truncatedTokenAQty !== 'NaN' && parseFloat(truncatedTokenAQty) > 0) {
            setSwapAllowed(true);
        } else {
            setSwapAllowed(false);
        }
    };

    return (
        <section className={styles.currency_converter}>
            <CurrencySelector
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                chainId={chainId}
                direction={isLiq ? 'Select Pair' : 'From:'}
                fieldId='sell'
                sellToken
                handleChangeEvent={handleTokenAChangeEvent}
                nativeBalance={props.nativeBalance}
                tokenABalance={tokenABalance}
                tokenBBalance={tokenBBalance}
                isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                isWithdrawToWalletChecked={isWithdrawToWalletChecked}
                setIsWithdrawToWalletChecked={setIsWithdrawToWalletChecked}
                reverseTokens={reverseTokens}
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
                handleChangeEvent={handleTokenBChangeEvent}
                nativeBalance={props.nativeBalance}
                tokenABalance={tokenABalance}
                tokenBBalance={tokenBBalance}
                isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                isWithdrawToWalletChecked={isWithdrawToWalletChecked}
                reverseTokens={reverseTokens}
                setIsWithdrawToWalletChecked={setIsWithdrawToWalletChecked}
            />
        </section>
    );
}
