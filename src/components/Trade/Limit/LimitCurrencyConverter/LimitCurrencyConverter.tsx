// START: Import React and Dongles
import { ChangeEvent, SetStateAction } from 'react';

import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';

import { setAddressTokenA, setAddressTokenB } from '../../../../utils/state/tradeDataSlice';

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
    poolPrice?: number;
    setIsSellTokenPrimary?: React.Dispatch<SetStateAction<boolean>>;
    setLimitAllowed: React.Dispatch<React.SetStateAction<boolean>>;
}

// central react functional component
export default function LimitCurrencyConverter(props: LimitCurrencyConverterProps) {
    const { tokenPair, tokensBank, chainId, setLimitAllowed } = props;

    const dispatch = useAppDispatch();

    // TODO: pass tokenPair to <LimitRate /> as a prop such that we can use a dynamic
    // TODO: ... logo instead of the hardcoded one it contains

    // hardcoded pool price
    const poolPrice = 0;
    const updateBuyQty = (evt: ChangeEvent<HTMLInputElement>) => {
        const input = parseFloat(evt.target.value);
        const output = (1 / poolPrice) * input;
        const buyQtyField = document.getElementById('limit-buy-quantity') as HTMLInputElement;

        if (buyQtyField) {
            buyQtyField.value = isNaN(output) ? '' : output.toString();
        }
        if (!isNaN(output) && output > 0) {
            setLimitAllowed(true);
        } else {
            setLimitAllowed(false);
        }
    };

    const updateSellQty = (evt: ChangeEvent<HTMLInputElement>) => {
        const input = parseFloat(evt.target.value);
        const output = poolPrice * input;
        const sellQtyField = document.getElementById('limit-sell-quantity') as HTMLInputElement;

        if (sellQtyField) {
            sellQtyField.value = isNaN(output) ? '' : output.toString();
        }
        if (!isNaN(output) && output > 0) {
            setLimitAllowed(true);
        } else {
            setLimitAllowed(false);
        }
    };

    const reverseTokens = (): void => {
        if (tokenPair) {
            dispatch(setAddressTokenA(tokenPair.dataTokenB.address));
            dispatch(setAddressTokenB(tokenPair.dataTokenA.address));
        }
        //   if (isTokenAPrimary) {
        //       setTokenBInputQty(tokenAInputQty);
        //       handleTokenBChangeEvent();
        //   } else {
        //       setTokenAInputQty(tokenBInputQty);
        //       handleTokenAChangeEvent();
        //   }
    };

    return (
        <section className={styles.currency_converter}>
            <LimitCurrencySelector
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                chainId={chainId}
                fieldId='sell'
                sellToken
                direction='Price'
                updateOtherQuantity={updateBuyQty}
                reverseTokens={reverseTokens}
            />
            <LimitCurrencySelector
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                chainId={chainId}
                fieldId='buy'
                direction='To'
                updateOtherQuantity={updateSellQty}
                reverseTokens={reverseTokens}
            />
            <div className={styles.arrow_container}>
                <span className={styles.arrow} />
            </div>
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
