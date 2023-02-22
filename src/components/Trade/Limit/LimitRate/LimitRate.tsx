import styles from './LimitRate.module.css';
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import { setLimitTick } from '../../../../utils/state/tradeDataSlice';
import { CrocPoolView, pinTickLower, pinTickUpper } from '@crocswap-libs/sdk';
import { Dispatch, SetStateAction } from 'react';
// import { tickToPrice, toDisplayPrice } from '@crocswap-libs/sdk';
interface propsIF {
    previousDisplayPrice: string;
    setPreviousDisplayPrice: Dispatch<SetStateAction<string>>;
    displayPrice: string;
    setDisplayPrice: Dispatch<SetStateAction<string>>;
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
    isOrderCopied: boolean;
}

export default function LimitRate(props: propsIF) {
    const {
        displayPrice,
        setDisplayPrice,
        previousDisplayPrice,
        setPreviousDisplayPrice,
        pool,
        gridSize,
        isSellTokenBase,
        setPriceInputFieldBlurred,
        fieldId,
        disable,
        poolPriceNonDisplay,
        // limitTickDisplayPrice,
        isOrderCopied,
    } = props;

    const dispatch = useAppDispatch();
    const isDenomBase = useAppSelector((state) => state.tradeData).isDenomBase;
    const limitTick = useAppSelector((state) => state.tradeData).limitTick;

    const initialLimitRateNonDisplay =
        (poolPriceNonDisplay || 0) * (isSellTokenBase ? 0.985 : 1.015);

    // console.log({ initialLimitRateNonDisplay });

    const pinnedInitialTick: number = isSellTokenBase
        ? pinTickLower(initialLimitRateNonDisplay, gridSize)
        : pinTickUpper(initialLimitRateNonDisplay, gridSize);

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

                    (limitRateInputField as HTMLInputElement).select();
                }}
                onChange={(event) => {
                    const isValid = event.target.value === '' || event.target.validity.valid;
                    isValid ? setDisplayPrice(event.target.value) : null;
                }}
                className={styles.currency_quantity}
                placeholder='0.0'
                // onChange={(event) => handleLimitChange(event.target.value)}
                onBlur={(event) => {
                    const isValid = event.target.value === '' || event.target.validity.valid;
                    const targetValue = event.target.value;
                    // console.log({ targetValue });
                    // console.log({ previousDisplayPrice });
                    if (isValid && targetValue !== previousDisplayPrice) {
                        handleLimitChange(targetValue.replaceAll(',', ''));
                        setPreviousDisplayPrice(targetValue);
                    }
                }}
                value={displayPrice}
                type='string'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern='^[0-9,]*[.]?[0-9]*$'
                disabled={disable}
                required
                // value={limitPrice}
            />
        </div>
    );

    return (
        <div className={`${styles.swapbox} ${isOrderCopied && styles.pulse_animation}`}>
            <span className={styles.direction} style={{ display: 'flex', alignItems: 'center' }}>
                <p style={{ fontSize: '14px' }}>Price</p>
                {limitTick !== pinnedInitialTick ? (
                    <button
                        className={styles.reset_limit_button}
                        onClick={() => {
                            dispatch(setLimitTick(pinnedInitialTick));
                            // console.log({ displayPrice });
                        }}
                    >
                        Top of Book
                    </button>
                ) : null}
            </span>

            <div className={`${styles.swap_input} `}>{rateInput}</div>
        </div>
    );
}
