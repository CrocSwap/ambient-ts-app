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
    poolPriceNonDisplay: number | undefined;
    insideTickDisplayPrice: number;
}

export default function LimitRate(props: LimitRatePropsIF) {
    const { fieldId, disable, setLimitRate } = props;

    const dispatch = useAppDispatch();

    const handleLimitChange = (value: string) => {
        dispatch(setLimitPrice(value));
        setLimitRate(value);
    };

    const rateInput = (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-quantity`}
                className={styles.currency_quantity}
                placeholder='0.0'
                onChange={(event) => handleLimitChange(event.target.value)}
                type='string'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern='^[0-9]*[.,]?[0-9]*$'
                disabled={disable}
                required
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
