import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import { setLimitTick } from '../../../../utils/state/tradeDataSlice';
import { pinTickLower, pinTickUpper } from '@crocswap-libs/sdk';
import { ChangeEvent, Dispatch, SetStateAction, useContext } from 'react';
import { HiPlus, HiMinus } from 'react-icons/hi';
import { IS_LOCAL_ENV } from '../../../../constants';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../../contexts/PoolContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import removeLeadingZeros from '../../../../utils/functions/removeLeadingZeros';
import { useSimulatedIsPoolInitialized } from '../../../../App/hooks/useSimulatedIsPoolInitialized';
import { FlexContainer } from '../../../../styled/Common';
import {
    LimitRateButton,
    LimitRateButtonContainer,
    TokenQuantityInput,
} from '../../../../styled/Components/TradeModules';

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
    const isPoolInitialized = useSimulatedIsPoolInitialized();

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

    const handleLimitChange = async (value: string) => {
        IS_LOCAL_ENV && console.debug({ value });
        if (pool) {
            const limit = await pool.fromDisplayPrice(
                isDenomBase ? parseFloat(value) : 1 / parseFloat(value),
            );

            if (limit) {
                const pinnedTick: number = isSellTokenBase
                    ? pinTickLower(limit, gridSize)
                    : pinTickUpper(limit, gridSize);

                dispatch(setLimitTick(pinnedTick));
            }
        }
    };

    const handleOnChange = (input: string) => setDisplayPrice(input);

    const handleOnBlur = async (input: string) => {
        let newDisplayPrice = removeLeadingZeros(input.replaceAll(',', ''));
        if (input.startsWith('.')) newDisplayPrice = `0${input}`;

        if (newDisplayPrice !== previousDisplayPrice) {
            await handleLimitChange(newDisplayPrice);
        }
        setPriceInputFieldBlurred(true);
    };

    return (
        <FlexContainer flexDirection='column' gap={4}>
            <FlexContainer
                alignItems='center'
                justifyContent='space-between'
                fontSize='body'
                color='text2'
            >
                <p>Price</p>
            </FlexContainer>
            <FlexContainer
                animation={showOrderPulseAnimation ? 'pulse' : ''}
                fullWidth
                justifyContent='space-between'
                alignItems='center'
                gap={4}
                id='limit_rate'
            >
                <FlexContainer
                    fullWidth
                    background='dark2'
                    style={{ borderRadius: 'var(--border-radius)' }}
                >
                    <TokenQuantityInput
                        id={`${fieldId}-quantity`}
                        onFocus={() => {
                            const limitRateInputField = document.getElementById(
                                'limit-rate-quantity',
                            );

                            (limitRateInputField as HTMLInputElement).select();
                        }}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleOnChange(e.target.value)
                        }
                        placeholder={
                            !isPoolInitialized ? 'Pool not initialized' : '0.0'
                        }
                        onBlur={(e: ChangeEvent<HTMLInputElement>) =>
                            handleOnBlur(e.target.value)
                        }
                        value={
                            !isPoolInitialized
                                ? 'Pool not initialized'
                                : displayPrice === 'NaN'
                                ? '...'
                                : displayPrice
                        }
                        type='number'
                        step='any'
                        inputMode='decimal'
                        autoComplete='off'
                        autoCorrect='off'
                        min='0'
                        minLength={1}
                        disabled={disable || !isPoolInitialized}
                        tabIndex={0}
                        aria-label='Limit Price.'
                        aria-live='polite'
                        aria-atomic='true'
                        aria-relevant='all'
                    />
                </FlexContainer>
                <LimitRateButtonContainer
                    flexDirection='column'
                    justifyContent='center'
                    alignItems='center'
                    background='dark2'
                    disabled={!isPoolInitialized}
                >
                    <LimitRateButton
                        onClick={!isDenomBase ? increaseTick : decreaseTick}
                        aria-label='Increase limit tick.'
                    >
                        <HiPlus />
                    </LimitRateButton>
                    <LimitRateButton
                        onClick={!isDenomBase ? decreaseTick : increaseTick}
                        aria-label='Decrease limit tick.'
                    >
                        <HiMinus />
                    </LimitRateButton>
                </LimitRateButtonContainer>
            </FlexContainer>
        </FlexContainer>
    );
}
