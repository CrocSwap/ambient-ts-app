// START: Import Local Files
import styles from './RangePriceInfo.module.css';
// import truncateDecimals from '../../../../utils/data/truncateDecimals';
// import makeCurrentPrice from './makeCurrentPrice';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import { useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import { useEffect, useState } from 'react';
import { TokenPriceFn } from '../../../../App/functions/fetchTokenPrice';
import { testTokenMap } from '../../../../utils/data/testTokenMap';
import { formatAmountOld } from '../../../../utils/numbers';
import { DefaultTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { getMoneynessRank } from '../../../../utils/functions/getMoneynessRank';

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
    baseToken: TokenIF;
    quoteToken: TokenIF;
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
    isAmbient: boolean;
}

// central react functional component
export default function RangePriceInfo(props: propsIF) {
    const {
        spotPriceDisplay,
        poolPriceCharacter,
        // maxPriceDisplay,
        // minPriceDisplay,
        aprPercentage,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
        pinnedDisplayPrices,
        isDenomBase,
        cachedFetchTokenPrice,
        tokenPair,
        chainId,
        isTokenABase,
        baseToken,
        quoteToken,
        isAmbient,
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

    const [isBaseTokenMoreMoneylike, setIsBaseTokenMoreMoneylike] =
        useState<boolean>(true);

    const [mainnetPriceEquivalentsExist, setMainnetPriceEquivalentsExist] =
        useState<boolean>(false);

    useEffect(() => {
        const baseTokenMoneynessRank = isTokenABase
            ? getMoneynessRank(tokenAAddress.toLowerCase() + '_' + chainId)
            : getMoneynessRank(tokenBAddress.toLowerCase() + '_' + chainId);
        const quoteTokenMoneynessRank = isTokenABase
            ? getMoneynessRank(tokenBAddress.toLowerCase() + '_' + chainId)
            : getMoneynessRank(tokenAAddress.toLowerCase() + '_' + chainId);

        setIsBaseTokenMoreMoneylike(
            baseTokenMoneynessRank >= quoteTokenMoneynessRank,
        );
    }, [tokenAAddress + tokenBAddress + chainId + isTokenABase]);

    useEffect(() => {
        setUserFlippedMaxMinDisplay(false);

        (async () => {
            const tokenAMainnetEquivalent =
                chainId === '0x1'
                    ? tokenAAddress
                    : testTokenMap
                          .get(tokenAAddress.toLowerCase() + '_' + chainId)
                          ?.split('_')[0];
            const tokenBMainnetEquivalent =
                chainId === '0x1'
                    ? tokenBAddress
                    : testTokenMap
                          .get(tokenBAddress.toLowerCase() + '_' + chainId)
                          ?.split('_')[0];

            if (tokenAMainnetEquivalent) {
                const tokenAMainnetEthPrice = await cachedFetchTokenPrice(
                    tokenAMainnetEquivalent,
                    '0x1',
                );
                const usdPrice = tokenAMainnetEthPrice?.usdPrice;

                setTokenAMainnetPrice(usdPrice);
            } else {
                setTokenAMainnetPrice(undefined);
                setMainnetPriceEquivalentsExist(false);
                return;
            }
            if (tokenBMainnetEquivalent) {
                const tokenBMainnetEthPrice = await cachedFetchTokenPrice(
                    tokenBMainnetEquivalent,
                    '0x1',
                );
                const usdPrice = tokenBMainnetEthPrice?.usdPrice;
                setTokenBMainnetPrice(usdPrice);
            } else {
                setTokenBMainnetPrice(undefined);
                setMainnetPriceEquivalentsExist(false);
                return;
            }
            setMainnetPriceEquivalentsExist(true);
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
        : isAmbient
        ? '0'
        : pinnedDisplayPrices
        ? pinnedDisplayPrices.pinnedMinPriceDisplayTruncatedWithCommas
        : '...';

    const maxPrice = userFlippedMaxMinDisplay
        ? maxPriceUsdEquivalent
        : isAmbient
        ? '∞'
        : pinnedDisplayPrices
        ? pinnedDisplayPrices.pinnedMaxPriceDisplayTruncatedWithCommas
        : '...';

    const isDenomTokenA =
        (isDenomBase && isTokenABase) || (!isDenomBase && !isTokenABase);

    const isDenomMoreMoneylike =
        (isDenomBase && isBaseTokenMoreMoneylike) ||
        (!isDenomBase && !isBaseTokenMoreMoneylike);

    const updatePoolPriceUsdEquivalent = () => {
        const spotPriceNum = parseFloat(spotPriceDisplay.replaceAll(',', ''));
        console.log({ spotPriceNum });
        if (!tokenBMainnetPrice || !tokenAMainnetPrice) return;

        let poolPriceNum;

        if (!isDenomMoreMoneylike) {
            if (isDenomTokenA) {
                poolPriceNum = spotPriceNum * tokenBMainnetPrice;
            } else {
                poolPriceNum = spotPriceNum * tokenAMainnetPrice;
            }
        } else {
            if (isDenomTokenA) {
                poolPriceNum = (1 / spotPriceNum) * tokenAMainnetPrice;
            } else {
                poolPriceNum = (1 / spotPriceNum) * tokenBMainnetPrice;
            }
        }

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
    };

    useEffect(() => {
        updatePoolPriceUsdEquivalent();
    }, [spotPriceDisplay, isDenomBase]);

    const pinnedMinPrice = pinnedDisplayPrices?.pinnedMinPriceDisplay;
    const pinnedMaxPrice = pinnedDisplayPrices?.pinnedMaxPriceDisplay;

    useEffect(() => {
        if (
            !pinnedMinPrice ||
            !pinnedMaxPrice ||
            !tokenBMainnetPrice ||
            !tokenAMainnetPrice
        )
            return;

        let minPriceNum, maxPriceNum;

        if (!isDenomMoreMoneylike) {
            if (isDenomTokenA) {
                minPriceNum = parseFloat(pinnedMinPrice) * tokenBMainnetPrice;

                maxPriceNum = parseFloat(pinnedMaxPrice) * tokenBMainnetPrice;
            } else {
                minPriceNum = parseFloat(pinnedMinPrice) * tokenAMainnetPrice;

                maxPriceNum = parseFloat(pinnedMaxPrice) * tokenAMainnetPrice;
            }
        } else {
            if (isDenomTokenA) {
                minPriceNum =
                    (1 / parseFloat(pinnedMaxPrice)) * tokenAMainnetPrice;
                maxPriceNum =
                    (1 / parseFloat(pinnedMinPrice)) * tokenAMainnetPrice;
            } else {
                minPriceNum =
                    (1 / parseFloat(pinnedMaxPrice)) * tokenBMainnetPrice;
                maxPriceNum =
                    (1 / parseFloat(pinnedMinPrice)) * tokenBMainnetPrice;
            }
        }

        if (!minPriceNum || !maxPriceNum) return;

        const minDisplayUsdPriceString =
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
        setMinPriceUsdEquivalent('~$' + minDisplayUsdPriceString);

        const maxDisplayUsdPriceString =
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
        setMaxPriceUsdEquivalent('~$' + maxDisplayUsdPriceString);
    }, [
        pinnedMinPrice,
        pinnedMaxPrice,
        userFlippedMaxMinDisplay,
        isDenomMoreMoneylike,
        isDenomTokenA,
    ]);

    const handleMinMaxPriceClick = () => {
        setUserFlippedMaxMinDisplay(!userFlippedMaxMinDisplay);
        console.log('clicked');
    };

    // JSX frag for lowest price in range

    const minimumPrice = mainnetPriceEquivalentsExist ? (
        <DefaultTooltip
            interactive
            title={`${minPriceUsdEquivalent} USD per ${
                isBaseTokenMoreMoneylike ? quoteToken.symbol : baseToken.symbol
            } `}
            // title={`Approx. USD value: ${minPriceUsdEquivalent.slice(1)}`}
            placement={'bottom'}
            arrow
            enterDelay={100}
            leaveDelay={200}
        >
            <div
                className={styles.price_display}
                onClick={handleMinMaxPriceClick}
            >
                <h4 className={styles.price_title}>Min Price</h4>
                <span className={styles.min_price}>
                    {isOnTradeRoute ? minPrice : minRangeDenomByMoneyness}
                    {/* {truncateDecimals(parseFloat(minPriceDisplay), 4).toString()} */}
                </span>
            </div>
        </DefaultTooltip>
    ) : (
        <div className={styles.price_display} style={{ cursor: 'default' }}>
            <h4 className={styles.price_title}>Min Price</h4>
            <span className={styles.min_price}>
                {isOnTradeRoute ? minPrice : minRangeDenomByMoneyness}
                {/* {truncateDecimals(parseFloat(minPriceDisplay), 4).toString()} */}
            </span>
        </div>
    );

    // const currentPrice = makeCurrentPrice(parseFloat(spotPriceDisplay), didUserFlipDenom);

    const currentPrice = userFlippedMaxMinDisplay
        ? '~$' + poolPriceUsdEquivalent
        : poolPriceCharacter + spotPriceDisplay;

    // JSX frag for highest price in range
    const maximumPrice = mainnetPriceEquivalentsExist ? (
        <DefaultTooltip
            interactive
            title={`${maxPriceUsdEquivalent} USD per ${
                isBaseTokenMoreMoneylike ? quoteToken.symbol : baseToken.symbol
            } `}
            // title={`Approx. USD value: ${minPriceUsdEquivalent.slice(1)}`}
            placement={'bottom'}
            arrow
            enterDelay={100}
            leaveDelay={200}
        >
            <div
                className={styles.price_display}
                onClick={handleMinMaxPriceClick}
            >
                <h4 className={styles.price_title}>Max Price</h4>
                <span className={styles.max_price}>
                    {isOnTradeRoute ? maxPrice : maxRangeDenomByMoneyness}
                    {/* {truncateDecimals(parseFloat(maxPriceDisplay), 4).toString()} */}
                </span>
            </div>
        </DefaultTooltip>
    ) : (
        <div className={styles.price_display} style={{ cursor: 'default' }}>
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
                            setUserFlippedMaxMinDisplay(false);
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
