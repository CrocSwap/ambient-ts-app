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

    const isDenomBase = tradeData.isDenomBase;
    const limitTick = tradeData.limitTick;

    const increaseTick = () => {
        if (limitTick) {
            dispatch(setLimitTick(limitTick + gridSize));
            setPriceInputFieldBlurred(true);
        }
    };

    const decreaseTick = () => {
        if (limitTick) {
            dispatch(setLimitTick(limitTick - gridSize));
            setPriceInputFieldBlurred(true);
        }
    };

    const handleLimitChange = (value: string) => {
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

    const rateInput = (
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
                        event.target.validity.valid;
                    isValid ? setDisplayPrice(event.target.value) : null;
                }}
                className={styles.currency_quantity}
                placeholder='0.0'
                onBlur={(event) => {
                    const isValid =
                        event.target.value === '' ||
                        event.target.validity.valid;
                    const targetValue = event.target.value;
                    if (isValid && targetValue !== previousDisplayPrice) {
                        handleLimitChange(targetValue.replaceAll(',', ''));
                        setPreviousDisplayPrice(targetValue);
                    }
                }}
                value={displayPrice === 'NaN' ? '...' : displayPrice}
                type='text'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern='^[0-9,]*[.]?[0-9]*[Ee]?[+-]?[0-9]*[.]?[0-9]*$'
                disabled={disable}
                tabIndex={0}
                aria-label='Limit Price.'
                aria-live='polite'
                aria-atomic='true'
                aria-relevant='all'
            />
        </div>
    );

    const buttonControls = (
        <div className={styles.button_controls}>
            <button
                onClick={!isDenomBase ? increaseTick : decreaseTick}
                aria-label='Increase limit tick.'
            >
                <HiPlus />
            </button>
            <button>
                <HiMinus
                    onClick={!isDenomBase ? decreaseTick : increaseTick}
                    aria-label='Decrease limit tick.'
                />
            </button>
        </div>
    );

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
                }}
            >
                <p>Price</p>
            </span>
            <div className={styles.swap_input} id='limit_rate'>
                {rateInput}
                {buttonControls}
            </div>
        </div>
    );
}
