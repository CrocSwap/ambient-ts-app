import { pinTickLower, pinTickUpper } from '@crocswap-libs/sdk';
import {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    useContext,
    useState,
} from 'react';
import { HiPlus, HiMinus } from 'react-icons/hi';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../../contexts/PoolContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { removeLeadingZeros } from '../../../../ambient-utils/dataLayer';
import { useSimulatedIsPoolInitialized } from '../../../../App/hooks/useSimulatedIsPoolInitialized';
import { updatesIF } from '../../../../utils/hooks/useUrlParams';
import { FlexContainer } from '../../../../styled/Common';
import {
    LimitRateButton,
    LimitRateButtonContainer,
    TokenQuantityInput,
} from '../../../../styled/Components/TradeModules';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import {
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import {
    pinTickToTickLower,
    pinTickToTickUpper,
} from '../../../../ambient-utils/dataLayer/functions/pinTick';
import { ExplanationButton } from '../../../Form/Icons/Icons.styles';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { Chip } from '../../../Form/Chip';

interface propsIF {
    previousDisplayPrice: string;
    setPreviousDisplayPrice: Dispatch<SetStateAction<string>>;
    displayPrice: string;
    setDisplayPrice: Dispatch<SetStateAction<string>>;
    setPriceInputFieldBlurred: Dispatch<SetStateAction<boolean>>;
    isSellTokenBase: boolean;
    disable?: boolean;
    updateURL: (changes: updatesIF) => void;
}

export default function LimitRate(props: propsIF) {
    const {
        displayPrice,
        setDisplayPrice,
        isSellTokenBase,
        setPriceInputFieldBlurred,
        disable,
        updateURL,
    } = props;

    const {
        chainData: { gridSize },
    } = useContext(CrocEnvContext);
    const { pool, usdPriceInverse, isTradeDollarizationEnabled, poolData } =
        useContext(PoolContext);
    const { showOrderPulseAnimation } = useContext(TradeTableContext);
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');
    const { chainData } = useContext(CrocEnvContext);

    const isPoolInitialized = useSimulatedIsPoolInitialized();
    const {
        isDenomBase,
        setLimitTick,
        limitTick,
        setIsTokenAPrimary,
        tokenA,
        tokenB,
        isTokenABase: isBid,
        currentPoolPriceTick,
    } = useContext(TradeDataContext);
    const {
        globalPopup: { open: openGlobalPopup },
    } = useContext(AppStateContext);
    const { basePrice, quotePrice, poolPriceDisplay } = poolData;

    const side =
        (isDenomBase && !isBid) || (!isDenomBase && isBid) ? 'buy' : 'sell';

    const increaseTick = (): void => {
        if (limitTick !== undefined) {
            const newLimitTick: number = limitTick + gridSize;
            setLimitTick(newLimitTick);
            updateURL({ update: [['limitTick', newLimitTick]] });
            setPriceInputFieldBlurred(true);
        }
    };

    const decreaseTick = (): void => {
        if (limitTick !== undefined) {
            const newLimitTick: number = limitTick - gridSize;
            setLimitTick(newLimitTick);
            updateURL({ update: [['limitTick', newLimitTick]] });
            setPriceInputFieldBlurred(true);
        }
    };

    const setTickToMinimum = (): void => {
        if (currentPoolPriceTick !== undefined) {
            const currentPoolPricePinned = pinTickToTickLower(
                currentPoolPriceTick,
                gridSize,
            );
            const newLimitTick: number = currentPoolPricePinned - gridSize;
            setLimitTick(newLimitTick);
            updateURL({ update: [['limitTick', newLimitTick]] });
            setPriceInputFieldBlurred(true);
        }
    };

    const setTickToMaximum = (): void => {
        if (currentPoolPriceTick !== undefined) {
            const currentPoolPricePinned = pinTickToTickUpper(
                currentPoolPriceTick,
                gridSize,
            );
            const newLimitTick: number = currentPoolPricePinned + gridSize;
            setLimitTick(newLimitTick);
            updateURL({ update: [['limitTick', newLimitTick]] });
            setPriceInputFieldBlurred(true);
        }
    };

    const handleLimitChange = async (value: string) => {
        if (pool) {
            if (parseFloat(value) === 0 || isNaN(parseFloat(value))) return;
            const limit = await pool.fromDisplayPrice(
                isDenomBase ? parseFloat(value) : 1 / parseFloat(value),
            );

            if (limit) {
                const pinnedTick: number = isSellTokenBase
                    ? pinTickLower(limit, gridSize)
                    : pinTickUpper(limit, gridSize);
                setLimitTick(pinnedTick);

                const newLimitNum = parseFloat(value);

                const currentPoolPriceNum = poolPriceDisplay
                    ? isDenomBase
                        ? 1 / poolPriceDisplay
                        : poolPriceDisplay
                    : undefined;

                const newLimitBelowCurrentPoolPrice = currentPoolPriceNum
                    ? newLimitNum < currentPoolPriceNum
                    : false;
                const shouldReverse =
                    side === 'sell'
                        ? newLimitBelowCurrentPoolPrice
                        : !newLimitBelowCurrentPoolPrice;

                if (shouldReverse) {
                    setIsTokenAPrimary((isTokenAPrimary) => !isTokenAPrimary);
                    linkGenLimit.redirect({
                        chain: chainData.chainId,
                        tokenA: tokenB.address,
                        tokenB: tokenA.address,
                        limitTick: pinnedTick,
                    });
                } else {
                    updateURL({ update: [['limitTick', pinnedTick]] });
                }
            }
        }
    };

    const isValidLimitInputString = (str: string) => {
        // matches dollar or non-dollar amounts
        return /^\$?\d*\.?\d*\$?$/.test(str); // allows $ at the end
        // return /^\$?\d*\.?\d*$/.test(str); // doesn't allow $ at the end
    };

    const handleOnChange = (input: string) => {
        if (!isValidLimitInputString(input)) return;
        setDisplayPrice(input);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleKeyDown = (e: any) => {
        const target = e.target as HTMLInputElement;
        if (e.key === 'Enter') {
            target && handleOnBlur(target.value); // Trigger blur event
        }
    };

    const handleOnBlur = async (input: string) => {
        const inputStartsWithDollar = input.startsWith('$');
        const inputEndsWithDollar = input.endsWith('$');
        const isDollarized =
            inputStartsWithDollar ||
            inputEndsWithDollar ||
            isTradeDollarizationEnabled;
        const parsedInput = parseFloat(
            inputStartsWithDollar
                ? input.slice(1)
                : inputEndsWithDollar
                ? input.slice(undefined, -1)
                : input,
        );

        const convertedFromDollarNum = isDollarized
            ? isDenomBase
                ? quotePrice
                    ? parsedInput / quotePrice
                    : usdPriceInverse
                    ? parsedInput / usdPriceInverse
                    : undefined
                : basePrice
                ? parsedInput / basePrice
                : usdPriceInverse
                ? parsedInput / usdPriceInverse
                : undefined
            : undefined;

        const newDisplayPrice = removeLeadingZeros(
            isDollarized && convertedFromDollarNum
                ? convertedFromDollarNum.toString()
                : input,
        );

        await handleLimitChange(newDisplayPrice);
        setPriceInputFieldBlurred(true);
    };

    const balancedPresets: number[] = [100, 1, 5, 10];
    type presetValues = typeof balancedPresets[number];

    const [limitRateValue, setLimitRateValue] = useState(5);

    function updateLimitRateWithButton(value: presetValues): void {
        setLimitRateValue(value);
        console.log({ limitRateValue });
    }

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
                    padding='0 16px'
                >
                    <TokenQuantityInput
                        id='limit_rate_input'
                        onFocus={() => {
                            const limitRateInputField =
                                document.getElementById('limit_rate_input');
                            (limitRateInputField as HTMLInputElement).select();
                        }}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleOnChange(e.target.value)
                        }
                        placeholder={
                            !isPoolInitialized
                                ? 'Pool not initialized'
                                : isTradeDollarizationEnabled
                                ? '$0.00'
                                : '0.0'
                        }
                        onBlur={(e: ChangeEvent<HTMLInputElement>) =>
                            handleOnBlur(e.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        value={
                            !isPoolInitialized
                                ? 'Pool not initialized'
                                : displayPrice === 'NaN'
                                ? '...'
                                : isTradeDollarizationEnabled &&
                                  !displayPrice.startsWith('$')
                                ? '$' + displayPrice
                                : displayPrice
                        }
                        type='string'
                        step='any'
                        inputMode='text'
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
                        id='increase_limit_rate_button'
                        onClick={!isDenomBase ? increaseTick : decreaseTick}
                        aria-label='Increase limit tick.'
                    >
                        <HiPlus />
                    </LimitRateButton>
                    <LimitRateButton
                        id='decrease_limit_tick_button'
                        onClick={!isDenomBase ? decreaseTick : increaseTick}
                        aria-label='Decrease limit tick.'
                    >
                        <HiMinus />
                    </LimitRateButton>
                </LimitRateButtonContainer>
            </FlexContainer>
            <FlexContainer
                fullWidth
                wrap
                alignItems='center'
                gap={10}
                padding='8px 0'
            >
                {balancedPresets.map((preset: presetValues) => {
                    const humanReadable: string =
                        preset === 100 ? 'Top' : preset.toString() + '%';
                    return (
                        <Chip
                            key={humanReadable}
                            id={`limit_rate_preset_${humanReadable}`}
                            variant={
                                limitRateValue === preset
                                    ? 'filled'
                                    : 'secondary'
                            }
                            onClick={() => {
                                if (preset === 100) {
                                    isSellTokenBase
                                        ? setTickToMinimum
                                        : setTickToMaximum;
                                }
                                updateLimitRateWithButton(preset);
                            }}
                            aria-label={`Set limit rate to ${humanReadable}.`}
                        >
                            {humanReadable}
                        </Chip>
                    );
                })}
                <ExplanationButton
                    onClick={() =>
                        openGlobalPopup(
                            <div>Limit rate explanation</div>,
                            'Limit Rate',
                            'right',
                        )
                    }
                    aria-label='Open limit rate explanation popup.'
                >
                    <AiOutlineInfoCircle color='var(--text2)' />
                </ExplanationButton>
            </FlexContainer>
        </FlexContainer>
    );
}
