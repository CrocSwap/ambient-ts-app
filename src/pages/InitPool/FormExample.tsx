import React, { useContext, useMemo, useState } from 'react';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { FlexContainer, FlexHeader, Text } from '../../styled/Common';
import styles from '../../components/Home/Landing/BackgroundImages.module.css';
import { SettingsSvg } from '../../assets/images/icons/settingsSvg';
import RangeTokenInput from '../../components/Trade/Range/RangeTokenInput/RangeTokenInput';
import { UserPreferenceContext } from '../../contexts/UserPreferenceContext';
import RangeBounds from '../../components/Global/RangeBounds/RangeBounds';
import { getFormattedNumber } from '../../App/functions/getFormattedNumber';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import Button from '../../components/Form/Button';
import { Chip } from '../../components/Form/Chip';

interface Props {
    title?: string;
}

export default function ExampleForm(props: Props) {
    const { dexBalRange } = useContext(UserPreferenceContext);

    // eslint-disable-next-line
    const [baseCollateral, setBaseCollateral] = useState<string>('');
    // eslint-disable-next-line
    const [quoteCollateral, setQuoteCollateral] = useState<string>('');

    const [isWithdrawTokenAFromDexChecked, setIsWithdrawTokenAFromDexChecked] =
        useState<boolean>(dexBalRange.drawFromDexBal.isEnabled);
    const [isWithdrawTokenBFromDexChecked, setIsWithdrawTokenBFromDexChecked] =
        useState<boolean>(dexBalRange.drawFromDexBal.isEnabled);

    // See Range.tsx line 81
    const [rangeWidthPercentage, setRangeWidthPercentage] =
        useState<number>(23);
    const [
        // eslint-disable-next-line
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
    ] = useState(false);

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
                blur={false}
            >
                <Chip onClick={() => console.log('Hello')}>Outlined</Chip>
                <Chip variant='filled' onClick={() => console.log('Hello')}>
                    Filled
                </Chip>
                <Chip variant='secondary' onClick={() => console.log('Hello')}>
                    Secondary
                </Chip>

                <FlexContainer
                    flexDirection='row'
                    justifyContent='space-between'
                >
                    <Text fontSize='body' color='text2'>
                        Collateral
                    </Text>
                </FlexContainer>

                <RangeTokenInput
                    hidePlus
                    isAmbient={false}
                    depositSkew={0}
                    isWithdrawFromDexChecked={{
                        tokenA: isWithdrawTokenAFromDexChecked,
                        tokenB: isWithdrawTokenBFromDexChecked,
                    }}
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
                    handleButtonMessage={{
                        tokenA: () => {
                            console.log('TODO: handleRangeButtonMessageTokenA');
                        },
                        tokenB: () => {
                            console.log('TODO: handleRangeButtonMessageTokenB');
                        },
                    }}
                    isInputDisabled={{
                        tokenA: false,
                        tokenB: false,
                    }}
                />
            </FlexContainer>
        );
    }, [
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
                <RangeBounds
                    isRangeBoundsDisabled={false}
                    {...rangeWidthProps}
                    {...rangePriceInfoProps}
                    {...minMaxPriceProps}
                    customSwitch={true}
                />
                <Button
                    title={'Confirm'}
                    action={() => console.log('Confirm')}
                />
                <Button
                    title={'Flat'}
                    action={() => console.log('Confirm')}
                    flat
                />
                <Button
                    title={'Thin'}
                    action={() => console.log('Confirm')}
                    flat
                    thin
                />
                <Button
                    title={'Disabled'}
                    action={() => console.log('Confirm')}
                    flat
                    disabled
                />
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
                outline='accent1'
                tablet={{ margin: '64px 0 0 0' }}
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
                    <FlexHeader height='41px'>
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
                            <SettingsSvg />

                            <p />
                            <IoIosCheckmarkCircle />
                        </FlexContainer>
                    </FlexHeader>
                    {/* Body */}
                    <FlexContainer gap={16}>
                        {LeftSide}
                        {RightSide}
                    </FlexContainer>
                </FlexContainer>
            </FlexContainer>
        </FlexContainer>
    );
}
