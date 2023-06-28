import styles from './LimitRate.module.css';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import { setLimitTick } from '../../../../utils/state/tradeDataSlice';
import { pinTickLower, pinTickUpper } from '@crocswap-libs/sdk';
import { Dispatch, SetStateAction, useContext } from 'react';
import { HiPlus, HiMinus } from 'react-icons/hi';
import { IS_LOCAL_ENV } from '../../../../constants';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../../contexts/PoolContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { exponentialNumRegEx } from '../../../../utils/regex/exports';

interface propsIF {
    previousDisplayPrice: string;
    setPreviousDisplayPrice: Dispatch<SetStateAction<string>>;
    displayPrice: string;
    setDisplayPrice: Dispatch<SetStateAction<string>>;
    setPriceInputFieldBlurred: Dispatch<SetStateAction<boolean>>;
    fieldId: string;
    isSellTokenBase: boolean;
    disable?: boolean;
}

export default function LimitRate(props: propsIF) {
    const {
        displayPrice,
        setDisplayPrice,
        previousDisplayPrice,
        setPreviousDisplayPrice,
        isSellTokenBase,
        setPriceInputFieldBlurred,
        fieldId,
        disable,
    } = props;

    const dispatch = useAppDispatch();
    const {
        chainData: { gridSize },
    } = useContext(CrocEnvContext);
    const { pool } = useContext(PoolContext);
    const { showOrderPulseAnimation } = useContext(TradeTableContext);

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase: boolean = tradeData.isDenomBase;
    const limitTick: number | undefined = tradeData.limitTick;

    const increaseTick = (): void => {
        if (limitTick) {
            dispatch(setLimitTick(limitTick + gridSize));
            setPriceInputFieldBlurred(true);
        }
    };

    const decreaseTick = (): void => {
        if (limitTick) {
            dispatch(setLimitTick(limitTick - gridSize));
            setPriceInputFieldBlurred(true);
        }
    };

    const handleLimitChange = (value: string): void => {
        IS_LOCAL_ENV && console.debug({ value });
        const limitNonDisplay = isDenomBase
            ? pool?.fromDisplayPrice(parseFloat(value))
            : pool?.fromDisplayPrice(1 / parseFloat(value));
        limitNonDisplay?.then((limit) => {
            const pinnedTick: number = isSellTokenBase
                ? pinTickLower(limit, gridSize)
                : pinTickUpper(limit, gridSize);
            dispatch(setLimitTick(pinnedTick));
            setPriceInputFieldBlurred(true);
        });
    };

    return (
        <div
            className={`${styles.swapbox} ${
                showOrderPulseAnimation && styles.pulse_animation
            }`}
        >
            <span
                className={styles.direction}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '19px',
                }}
            >
                <p>Price</p>
            </span>
            <div className={styles.swap_input} id='limit_rate'>
                <div className={styles.token_amount}>
                    <input
                        id={`${fieldId}-quantity`}
                        onFocus={() => {
                            const limitRateInputField = document.getElementById(
                                'limit-rate-quantity',
                            );

                            (limitRateInputField as HTMLInputElement).select();
                        }}
                        onChange={(event) => {
                            const isValid =
                                event.target.value === '' ||
                                event.target.value === '.' ||
                                event.target.validity.valid;
                            const input = event.target.value.startsWith('.')
                                ? '0' + event.target.value
                                : event.target.value;
                            isValid ? setDisplayPrice(input) : null;
                        }}
                        className={styles.currency_quantity}
                        placeholder='0.0'
                        onBlur={(event) => {
                            const isValid =
                                event.target.value === '' ||
                                event.target.validity.valid;
                            const targetValue = event.target.value;
                            if (
                                isValid &&
                                targetValue !== previousDisplayPrice
                            ) {
                                // current value of input allowing sanitation
                                let targetValPositive = targetValue.trim();
                                // fn to determine if input has invalid leading char
                                const checkFirstCharValid = (): boolean => {
                                    return (
                                        targetValPositive.startsWith('-') ||
                                        targetValPositive.startsWith('+') ||
                                        targetValPositive.startsWith(',') ||
                                        targetValPositive.startsWith('%') ||
                                        targetValPositive.startsWith('e') ||
                                        targetValPositive.startsWith('E')
                                    );
                                };
                                // remove all leading invalid character from input string
                                while (checkFirstCharValid()) {
                                    targetValPositive =
                                        targetValPositive.substring(1);
                                }
                                handleLimitChange(
                                    targetValPositive.replaceAll(',', ''),
                                );

                                setPreviousDisplayPrice(targetValPositive);
                            }
                        }}
                        value={displayPrice === 'NaN' ? '...' : displayPrice}
                        type='text'
                        inputMode='decimal'
                        autoComplete='off'
                        autoCorrect='off'
                        min='0'
                        minLength={1}
                        pattern={exponentialNumRegEx.source}
                        disabled={disable}
                        tabIndex={0}
                        aria-label='Limit Price.'
                        aria-live='polite'
                        aria-atomic='true'
                        aria-relevant='all'
                    />
                </div>
                <div className={styles.button_controls}>
                    <button
                        onClick={!isDenomBase ? increaseTick : decreaseTick}
                        aria-label='Increase limit tick.'
                    >
                        <HiPlus />
                    </button>
                    <button
                        onClick={!isDenomBase ? decreaseTick : increaseTick}
                        aria-label='Decrease limit tick.'
                    >
                        <HiMinus />
                    </button>
                </div>
            </div>
        </div>
    );
}
