import { Dispatch, SetStateAction } from 'react';
import styles from './LimitRate.module.css';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import { setLimitPrice } from '../../../../utils/state/tradeDataSlice';

interface LimitRatePropsIF {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    fieldId: string;
    chainId: string;
    sellToken?: boolean;
    disable?: boolean;
    reverseTokens: () => void;
    setLimitRate: Dispatch<SetStateAction<string>>;
    onBlur: () => void;
    poolPriceNonDisplay: number | undefined;
    insideTickDisplayPrice: number;
    limitRate: string;
}

export default function LimitRate(props: LimitRatePropsIF) {
    const { fieldId, disable, setLimitRate, onBlur, limitRate } = props;

    const dispatch = useAppDispatch();

    const handleLimitChange = (value: string) => {
        dispatch(setLimitPrice(value));
        setLimitRate(value);
    };

    const rateInput = (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-quantity`}
                onFocus={() => {
                    const limitRateInputField = document.getElementById('limit-rate-quantity');
                    if (limitRateInputField)
                        (limitRateInputField as HTMLInputElement).value = limitRate;
                }}
                className={styles.currency_quantity}
                placeholder='0.0'
                onChange={(event) => handleLimitChange(event.target.value)}
                onBlur={() => onBlur()}
                type='string'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern='^[0-9]*[.,]?[0-9]*$'
                disabled={disable}
                required
                value={props.limitRate}
            />
        </div>
    );

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}>Price</span>
            <div className={styles.swap_input}>{rateInput}</div>
        </div>
    );
}
