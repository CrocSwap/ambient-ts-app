import { ChangeEvent, SetStateAction } from 'react';
import styles from './CurrencyConverter.module.css';
import CurrencySelector from '../CurrencySelector/CurrencySelector';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { setAddressTokenA, setAddressTokenB } from '../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';

interface CurrencyConverterProps {
    tokenPair: {
        dataTokenA: TokenIF;
        dataTokenB: TokenIF;
    };
    tokensBank: Array<TokenIF>;
    chainId: string;
    isLiq: boolean;
    poolPrice: number;
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

export default function CurrencyConverter(props: CurrencyConverterProps) {
    const {
        tokenPair,
        tokensBank,
        chainId,
        isLiq,
        poolPrice,
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

    const updateBuyQty = (evt: ChangeEvent<HTMLInputElement>) => {
        const input = parseFloat(evt.target.value);
        const output = (1 / poolPrice) * input;
        const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;
        setIsSellTokenPrimary(true);
        if (buyQtyField) {
            buyQtyField.value = isNaN(output) ? '' : output.toString();
        }
        if (!isNaN(output) && output > 0) {
            setSwapAllowed(true);
        } else {
            setSwapAllowed(false);
        }
    };

    const updateSellQty = (evt: ChangeEvent<HTMLInputElement>) => {
        const input = parseFloat(evt.target.value);
        const output = poolPrice * input;
        const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;
        setIsSellTokenPrimary(false);
        if (sellQtyField) {
            sellQtyField.value = isNaN(output) ? '' : output.toString();
        }
        if (!isNaN(output) && output > 0) {
            setSwapAllowed(true);
        } else {
            setSwapAllowed(false);
        }
    };

    const dispatch = useAppDispatch();

    const handleArrowClick = (): void => {
        if (tokenPair) {
            dispatch(setAddressTokenA(tokenPair.dataTokenB.address));
            dispatch(setAddressTokenB(tokenPair.dataTokenA.address));
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
                updateOtherQuantity={updateBuyQty}
                nativeBalance={props.nativeBalance}
                tokenABalance={tokenABalance}
                tokenBBalance={tokenBBalance}
                isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                isWithdrawToWalletChecked={isWithdrawToWalletChecked}
                setIsWithdrawToWalletChecked={setIsWithdrawToWalletChecked}
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
                setIsWithdrawToWalletChecked={setIsWithdrawToWalletChecked}
            />
        </section>
    );
}
