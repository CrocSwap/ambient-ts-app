// START: Import Local Files
import styles from './RangePriceInfo.module.css';
// import truncateDecimals from '../../../../utils/data/truncateDecimals';
// import makeCurrentPrice from './makeCurrentPrice';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import { useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import { useEffect, useState } from 'react';
import { TokenPriceFn } from '../../../../App/functions/fetchTokenPrice';
import { testTokenMap } from '../../../../utils/data/testTokenMap';
import { formatAmountOld } from '../../../../utils/numbers';

// interface for component props
interface propsIF {
    tokenPair: TokenPairIF;
    spotPriceDisplay: string;
    maxPriceDisplay: string;
    minPriceDisplay: string;
    aprPercentage: number | undefined;
    daysInRange: number | undefined;
    didUserFlipDenom: boolean;
    poolPriceCharacter: string;
    minRangeDenomByMoneyness?: string;
    maxRangeDenomByMoneyness?: string;
    isDenomBase: boolean;
    cachedFetchTokenPrice: TokenPriceFn;
    chainId: string;
    isTokenABase: boolean;
    pinnedDisplayPrices:
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
        | undefined;
}

// central react functional component
export default function RangePriceInfo(props: propsIF) {
    const {
        spotPriceDisplay,
        poolPriceCharacter,
        // maxPriceDisplay,
        // minPriceDisplay,
        aprPercentage,
        didUserFlipDenom,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
        pinnedDisplayPrices,
        isDenomBase,
        cachedFetchTokenPrice,
        tokenPair,
        chainId,
        isTokenABase,
    } = props;

    const { pathname } = useLocation();

    const isOnTradeRoute = pathname.includes('trade');

    const dispatch = useAppDispatch();

    const aprPercentageString = aprPercentage
        ? `Est. APR | ${aprPercentage.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })}%`
        : '…';
    // JSX frag for estimated APR of position
    const apr = <span className={styles.apr}>{aprPercentageString}</span>;

    const [tokenAMainnetPrice, setTokenAMainnetPrice] = useState<
        number | undefined
    >();
    const [tokenBMainnetPrice, setTokenBMainnetPrice] = useState<
        number | undefined
    >();

    const tokenAAddress = tokenPair?.dataTokenA?.address;
    const tokenBAddress = tokenPair?.dataTokenB?.address;

    useEffect(() => {
        (async () => {
            const tokenAMainnetEquivalent = testTokenMap
                .get(tokenAAddress.toLowerCase() + '_' + chainId)
                ?.split('_')[0];
            const tokenBMainnetEquivalent = testTokenMap
                .get(tokenBAddress.toLowerCase() + '_' + chainId)
                ?.split('_')[0];

            console.log('fetching WETH price from mainnet');
            if (tokenAMainnetEquivalent) {
                const tokenAMainnetEthPrice = await cachedFetchTokenPrice(
                    tokenAMainnetEquivalent,
                    '0x1',
                );
                const usdPrice = tokenAMainnetEthPrice?.usdPrice;

                setTokenAMainnetPrice(usdPrice);
            }
            if (tokenBMainnetEquivalent) {
                const tokenBMainnetEthPrice = await cachedFetchTokenPrice(
                    tokenBMainnetEquivalent,
                    '0x1',
                );
                const usdPrice = tokenBMainnetEthPrice?.usdPrice;
                setTokenBMainnetPrice(usdPrice);
            }
        })();
    }, [tokenAAddress + tokenBAddress]);

    const [userFlippedMaxMinDisplay, setUserFlippedMaxMinDisplay] =
        useState<boolean>(false);

    const [poolPriceUsdEquivalent, setPoolPriceUsdEquivalent] =
        useState<string>('');
    const [minPriceUsdEquivalent, setMinPriceUsdEquivalent] =
        useState<string>('');
    const [maxPriceUsdEquivalent, setMaxPriceUsdEquivalent] =
        useState<string>('');

    const minPrice = userFlippedMaxMinDisplay
        ? minPriceUsdEquivalent
        : pinnedDisplayPrices?.pinnedMinPriceDisplayTruncatedWithCommas;

    const maxPrice = userFlippedMaxMinDisplay
        ? maxPriceUsdEquivalent
        : pinnedDisplayPrices?.pinnedMaxPriceDisplayTruncatedWithCommas;

    useEffect(() => {
        const spotPriceNum = parseFloat(spotPriceDisplay.replaceAll(',', ''));
        console.log({ spotPriceNum });

        if (isDenomBase && spotPriceNum && tokenAMainnetPrice) {
            const poolPriceNum = spotPriceNum * tokenAMainnetPrice;
            const displayUsdPriceString =
                poolPriceNum === Infinity || poolPriceNum === 0
                    ? '…'
                    : poolPriceNum < 0.00001
                    ? poolPriceNum.toExponential(2)
                    : poolPriceNum < 2
                    ? poolPriceNum.toPrecision(3)
                    : poolPriceNum >= 100000
                    ? formatAmountOld(poolPriceNum, 1)
                    : poolPriceNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            setPoolPriceUsdEquivalent(displayUsdPriceString);
        } else if (!isDenomBase && spotPriceNum && tokenBMainnetPrice) {
            const poolPriceNum = spotPriceNum * tokenBMainnetPrice;
            const displayUsdPriceString =
                poolPriceNum === Infinity || poolPriceNum === 0
                    ? '…'
                    : poolPriceNum < 0.00001
                    ? poolPriceNum.toExponential(2)
                    : poolPriceNum < 2
                    ? poolPriceNum.toPrecision(3)
                    : poolPriceNum >= 100000
                    ? formatAmountOld(poolPriceNum, 1)
                    : poolPriceNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            setPoolPriceUsdEquivalent(displayUsdPriceString);
        }
    }, [spotPriceDisplay]);

    useEffect(() => {
        const pinnedMinPrice = pinnedDisplayPrices?.pinnedMinPriceDisplay;
        const pinnedMaxPrice = pinnedDisplayPrices?.pinnedMaxPriceDisplay;

        console.log({ tokenAMainnetPrice });
        console.log({ tokenBMainnetPrice });
        console.log({ didUserFlipDenom });
        console.log({ isDenomBase });
        console.log({ isTokenABase });
        console.log({ pinnedMinPrice });
        console.log({ pinnedMaxPrice });

        if (
            isDenomBase &&
            !isTokenABase &&
            tokenBMainnetPrice &&
            pinnedMinPrice
        ) {
            const minPriceNum = parseFloat(pinnedMinPrice) * tokenBMainnetPrice;

            const displayUsdPriceString =
                minPriceNum === Infinity || minPriceNum === 0
                    ? '…'
                    : minPriceNum < 0.00001
                    ? minPriceNum.toExponential(2)
                    : minPriceNum < 2
                    ? minPriceNum.toPrecision(3)
                    : minPriceNum >= 100000
                    ? formatAmountOld(minPriceNum, 1)
                    : minPriceNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            setMinPriceUsdEquivalent('$' + displayUsdPriceString);
        }

        if (
            isDenomBase &&
            !isTokenABase &&
            tokenAMainnetPrice &&
            pinnedMaxPrice
        ) {
            const maxPriceNum = parseFloat(pinnedMaxPrice) * tokenAMainnetPrice;

            const displayUsdPriceString =
                maxPriceNum === Infinity || maxPriceNum === 0
                    ? '…'
                    : maxPriceNum < 0.00001
                    ? maxPriceNum.toExponential(2)
                    : maxPriceNum < 2
                    ? maxPriceNum.toPrecision(3)
                    : maxPriceNum >= 100000
                    ? formatAmountOld(maxPriceNum, 1)
                    : maxPriceNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            setMaxPriceUsdEquivalent('$' + displayUsdPriceString);
        }
    }, [
        JSON.stringify(pinnedDisplayPrices),
        userFlippedMaxMinDisplay,
        isDenomBase,
    ]);

    const handleMinMaxPriceClick = () => {
        setUserFlippedMaxMinDisplay(!userFlippedMaxMinDisplay);
        console.log('clicked');
    };

    // JSX frag for lowest price in range
    const minimumPrice = (
        <div className={styles.price_display} onClick={handleMinMaxPriceClick}>
            <h4 className={styles.price_title}>Min Price</h4>
            <span className={styles.min_price}>
                {isOnTradeRoute ? minPrice : minRangeDenomByMoneyness}
                {/* {truncateDecimals(parseFloat(minPriceDisplay), 4).toString()} */}
            </span>
        </div>
    );

    // const currentPrice = makeCurrentPrice(parseFloat(spotPriceDisplay), didUserFlipDenom);

    const currentPrice = userFlippedMaxMinDisplay
        ? '$' + poolPriceUsdEquivalent
        : poolPriceCharacter + spotPriceDisplay;

    // JSX frag for highest price in range
    const maximumPrice = (
        <div className={styles.price_display} onClick={handleMinMaxPriceClick}>
            <h4 className={styles.price_title}>Max Price</h4>
            <span className={styles.max_price}>
                {isOnTradeRoute ? maxPrice : maxRangeDenomByMoneyness}
                {/* {truncateDecimals(parseFloat(maxPriceDisplay), 4).toString()} */}
            </span>
        </div>
    );

    return (
        <div className={styles.price_info_container}>
            {apr}
            <div className={styles.price_info_content}>
                {minimumPrice}
                <div className={styles.price_display}>
                    <h4 className={styles.price_title}>Current Price</h4>
                    <span
                        className={styles.current_price}
                        onClick={() => {
                            dispatch(toggleDidUserFlipDenom());
                        }}
                    >
                        {currentPrice === 'Infinity' ? '…' : `${currentPrice}`}
                    </span>
                </div>
                {maximumPrice}
            </div>
        </div>
    );
}
