import styles from './LimitRate.module.css';
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import { setLimitTick } from '../../../../utils/state/tradeDataSlice';
import { CrocPoolView, pinTickLower, pinTickUpper } from '@crocswap-libs/sdk';
import { Dispatch, SetStateAction } from 'react';
// import { tickToPrice, toDisplayPrice } from '@crocswap-libs/sdk';

interface LimitRatePropsIF {
    setPriceInputFieldBlurred: Dispatch<SetStateAction<boolean>>;
    gridSize: number;
    pool: CrocPoolView | undefined;
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    fieldId: string;
    chainId: string;
    sellToken?: boolean;
    isSellTokenBase: boolean;
    disable?: boolean;
    reverseTokens: () => void;
    // onBlur: () => void;
    poolPriceNonDisplay: number | undefined;
    limitTickDisplayPrice: number;
}

export default function LimitRate(props: LimitRatePropsIF) {
    const {
        pool,
        gridSize,
        isSellTokenBase,
        setPriceInputFieldBlurred,
        fieldId,
        disable,
        limitTickDisplayPrice,
    } = props;

    const dispatch = useAppDispatch();
    const isDenomBase = useAppSelector((state) => state.tradeData).isDenomBase;
    // const limitTick = useAppSelector((state) => state.tradeData).limitTick;

    const handleLimitChange = (value: string) => {
        console.log({ value });
        // const limitNonDisplay = pool?.fromDisplayPrice(parseFloat(value));
        const limitNonDisplay = isDenomBase
            ? pool?.fromDisplayPrice(parseFloat(value))
            : pool?.fromDisplayPrice(1 / parseFloat(value));

        limitNonDisplay?.then((limit) => {
            // const limitPriceInTick = Math.log(limit) / Math.log(1.0001);
            const pinnedTick: number = isSellTokenBase
                ? pinTickLower(limit, gridSize)
                : pinTickUpper(limit, gridSize);
            // console.log({ limitPriceInTick });
            // console.log({ isDenomBase });
            dispatch(setLimitTick(pinnedTick));
            setPriceInputFieldBlurred(true);
        });
    };

    //    onFocusPriceDisplay;

    const rateInput = (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-quantity`}
                onFocus={() => {
                    const limitRateInputField = document.getElementById('limit-rate-quantity');
                    if (limitRateInputField)
                        (limitRateInputField as HTMLInputElement).value =
                            limitTickDisplayPrice.toString();
                    (limitRateInputField as HTMLInputElement).select();
                }}
                className={styles.currency_quantity}
                placeholder='0.0'
                // onChange={(event) => handleLimitChange(event.target.value)}
                onBlur={(event) => {
                    // console.log('blurred');
                    handleLimitChange(event.target.value);
                }}
                type='string'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern='^[0-9]*[.,]?[0-9]*$'
                disabled={disable}
                required
                // value={limitPrice}
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
