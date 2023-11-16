import React, { useContext, useMemo, useState } from 'react';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { Container, FlexContainer, Text } from '../../styled/Common';
import styles from '../../components/Home/Landing/BackgroundImages.module.css';
import RangeTokenInput from '../../components/Trade/Range/RangeTokenInput/RangeTokenInput';
import { UserPreferenceContext } from '../../contexts/UserPreferenceContext';
import { getFormattedNumber } from '../../App/functions/getFormattedNumber';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import Button from '../../components/Form/Button';
import { Chip } from '../../components/Form/Chip';
import RangeWidth from '../../components/Form/RangeWidth/RangeWidth';
import TokenInputQuantity from '../../components/Form/TokenInputQuantity';
import Toggle from '../../components/Form/Toggle';
import FormFooter from './FormFooterExample';
import { TradeDataContext } from '../../contexts/TradeDataContext';

export default function ExampleForm() {
    const { dexBalRange } = useContext(UserPreferenceContext);

    // eslint-disable-next-line
    const [baseCollateral, setBaseCollateral] = useState<string>('');
    // eslint-disable-next-line
    const [quoteCollateral, setQuoteCollateral] = useState<string>('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isWithdrawTokenAFromDexChecked, setIsWithdrawTokenAFromDexChecked] =
        useState<boolean>(dexBalRange.drawFromDexBal.isEnabled);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isWithdrawTokenBFromDexChecked, setIsWithdrawTokenBFromDexChecked] =
        useState<boolean>(dexBalRange.drawFromDexBal.isEnabled);

    const [rangeWidthPercentage, setRangeWidthPercentage] =
        useState<number>(23);
    const [
        // eslint-disable-next-line
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
    ] = useState(false);

    const [inputValue, setInputValue] = useState<string>('');
    const [isOn, setIsOn] = useState<boolean>(false);

    // eslint-disable-next-line
    const [pinnedDisplayPrices, setPinnedDisplayPrices] = useState<
        | {
              pinnedMinPriceDisplay: string;
              pinnedMaxPriceDisplay: string;
              pinnedMinPriceDisplayTruncated: string;
              pinnedMaxPriceDisplayTruncated: string;
              pinnedMinPriceDisplayTruncatedWithCommas: string;
              pinnedMaxPriceDisplayTruncatedWithCommas: string;
              pinnedLowTick: number;
              pinnedHighTick: number;
              pinnedMinPriceNonDisplay: number;
              pinnedMaxPriceNonDisplay: number;
          }
        | undefined
    >();

    // Min Max Price
    const [minPriceInputString, setMinPriceInputString] = useState<string>('');
    const [maxPriceInputString, setMaxPriceInputString] = useState<string>('');
    // eslint-disable-next-line
    const [minPriceDifferencePercentage, setMinPriceDifferencePercentage] =
        useState(-10);
    // eslint-disable-next-line
    const [maxPriceDifferencePercentage, setMaxPriceDifferencePercentage] =
        useState(10);
    // eslint-disable-next-line
    const [rangeLowBoundFieldBlurred, setRangeLowBoundFieldBlurred] =
        useState(false);
    // eslint-disable-next-line
    const [rangeHighBoundFieldBlurred, setRangeHighBoundFieldBlurred] =
        useState(false);
    const [minPrice, setMinPrice] = useState(10);
    const [maxPrice, setMaxPrice] = useState(100);

    const { tokenA } = useContext(TradeDataContext);

    const rangeWidthProps = {
        rangeWidthPercentage: rangeWidthPercentage,
        setRangeWidthPercentage: setRangeWidthPercentage,
        setRescaleRangeBoundariesWithSlider:
            setRescaleRangeBoundariesWithSlider,
        inputId: 'init_pool_slider',
    };

    const rangePriceInfoProps = {
        pinnedDisplayPrices: pinnedDisplayPrices,
        spotPriceDisplay: getFormattedNumber({
            value: 1,
        }),
        maxPriceDisplay: 0,
        minPriceDisplay: 'Infinity',
        aprPercentage: 10,
        daysInRange: 10,
        isTokenABase: false,
        poolPriceCharacter: getUnicodeCharacter('ETH'),
        isAmbient: false,
    };

    const minMaxPriceProps = {
        minPricePercentage: minPriceDifferencePercentage,
        maxPricePercentage: maxPriceDifferencePercentage,
        minPriceInputString: minPriceInputString,
        maxPriceInputString: maxPriceInputString,
        setMinPriceInputString: setMinPriceInputString,
        setMaxPriceInputString: setMaxPriceInputString,
        isDenomBase: true,
        highBoundOnBlur: () => setRangeHighBoundFieldBlurred(true),
        lowBoundOnBlur: () => setRangeLowBoundFieldBlurred(true),
        rangeLowTick: 0,
        rangeHighTick: 10,
        disable: false,
        maxPrice: maxPrice,
        minPrice: minPrice,
        setMaxPrice: setMaxPrice,
        setMinPrice: setMinPrice,
    };

    const LeftSide = useMemo(() => {
        return (
            <FlexContainer
                flexDirection='column'
                justifyContent='center'
                gap={10}
            >
                <Text>Here is an example form with some common components</Text>
                <FlexContainer gap={8}>
                    <Toggle
                        key={'toggle'}
                        isOn={isOn}
                        disabled={false}
                        handleToggle={() => setIsOn(!isOn)}
                        id='modal_toggle'
                        aria-label={'aria-label'}
                    />
                    <Text>Toggle</Text>
                </FlexContainer>
                <Chip onClick={() => console.log('Hello')}>Outlined</Chip>
                <Chip variant='filled' onClick={() => console.log('Hello')}>
                    Filled
                </Chip>
                <Chip variant='secondary' onClick={() => console.log('Hello')}>
                    Secondary
                </Chip>

                <TokenInputQuantity
                    label='Select Token'
                    tokenAorB={null}
                    value={inputValue}
                    handleTokenInputEvent={setInputValue}
                    parseInput={(input: string) => {
                        return input;
                    }}
                    disable={false}
                    token={tokenA}
                    setTokenModalOpen={() => {
                        return null;
                    }}
                    fieldId='exchangeBalance'
                />

                <FlexContainer
                    flexDirection='row'
                    justifyContent='space-between'
                >
                    <Text fontSize='body' color='text2'>
                        Collateral
                    </Text>
                </FlexContainer>

                <RangeTokenInput
                    isAmbient={false}
                    depositSkew={0}
                    isWithdrawFromDexChecked={{
                        tokenA: isWithdrawTokenAFromDexChecked,
                        tokenB: isWithdrawTokenBFromDexChecked,
                    }}
                    poolPriceNonDisplay={0}
                    isOutOfRange={false}
                    tokenAInputQty={{
                        value: baseCollateral,
                        set: setBaseCollateral,
                    }}
                    tokenBInputQty={{
                        value: quoteCollateral,
                        set: setQuoteCollateral,
                    }}
                    toggleDexSelection={() => console.log('Hello')}
                    isInputDisabled={{
                        tokenA: false,
                        tokenB: false,
                    }}
                />
            </FlexContainer>
        );
    }, [
        inputValue,
        isOn,
        baseCollateral,
        quoteCollateral,
        isWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked,
    ]);

    const RightSide = useMemo(() => {
        return (
            <FlexContainer
                padding='0 8px'
                flexDirection='column'
                gap={8}
                alignItems='center'
            >
                <RangeWidth {...rangeWidthProps} />

                <Button
                    idForDOM={'example_gradient_button}'}
                    title={'Gradient'}
                    action={() => console.log('Confirm')}
                />
                <Button
                    idForDOM={'example_flat_button}'}
                    title={'Flat'}
                    action={() => console.log('Confirm')}
                    flat
                />
                <Button
                    idForDOM={'example_thin_button}'}
                    title={'Thin'}
                    action={() => console.log('Confirm')}
                    flat
                    thin
                />
                <Button
                    idForDOM={'example_disabled_button}'}
                    title={'Disabled'}
                    action={() => console.log('Confirm')}
                    flat
                    disabled
                />
                <FlexContainer fullWidth overlay='blur'>
                    <Button
                        idForDOM={'example_blur_button}'}
                        title={'Blur'}
                        action={() => console.log('Confirm')}
                        flat
                    />
                </FlexContainer>
            </FlexContainer>
        );
    }, [rangeWidthProps, rangePriceInfoProps, minMaxPriceProps]);

    return (
        <FlexContainer
            width='100vw'
            height='100vh'
            justifyContent='center'
            alignItems='flex-start'
            className={styles.background}
        >
            <FlexContainer
                background='dark1'
                rounded
                padding='16px'
                textAlign='center'
                flexDirection='column'
                outline='accent5'
                fullWidth
                alignItems='center'
                // This means that if it's greater than lg, use these styles
                lg={{
                    margin: '64px 0 0 0',
                    outline: 'accent1',
                    width: 'auto',
                }}
            >
                <FlexContainer
                    rounded
                    background='dark1'
                    position='relative'
                    padding={'16px'}
                    transition
                    flexDirection='column'
                >
                    {/* Header */}
                    <FlexContainer as='header' height='41px'>
                        <p />
                        <Text
                            fontSize='header1'
                            margin='auto'
                            fontWeight={'200'}
                        >
                            Example Form
                        </Text>
                        <FlexContainer
                            gap={8}
                            alignItems='center'
                            fontSize='header1'
                        >
                            <p></p>
                            <p />
                            <IoIosCheckmarkCircle />
                        </FlexContainer>
                    </FlexContainer>
                    {/* Body */}
                    <Container
                        display='flex'
                        gap={16}
                        justifyContent='space-around'
                        flexDirection='column'
                        maxWidth='500px'
                        lg={{
                            display: 'grid',
                            numCols: 2,
                            maxWidth: 'none',
                        }}
                    >
                        {LeftSide}
                        {RightSide}
                        <FormFooter type='explicit' />
                    </Container>
                </FlexContainer>
            </FlexContainer>
        </FlexContainer>
    );
}
