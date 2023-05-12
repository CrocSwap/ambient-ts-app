// START: Import Local Files
import styles from './RangePriceInfo.module.css';
// import truncateDecimals from '../../../../utils/data/truncateDecimals';
// import makeCurrentPrice from './makeCurrentPrice';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import { memo, useContext, useEffect, useMemo, useState } from 'react';
import { TokenPriceFn } from '../../../../App/functions/fetchTokenPrice';
import { testTokenMap } from '../../../../utils/data/testTokenMap';
import { formatAmountOld } from '../../../../utils/numbers';
import { DefaultTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { isStableToken } from '../../../../utils/data/stablePairs';
import AprExplanation from '../../../Global/Informational/AprExplanation';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { AppStateContext } from '../../../../contexts/AppStateContext';

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
function RangePriceInfo(props: propsIF) {
    const {
        spotPriceDisplay,
        poolPriceCharacter,
        aprPercentage,
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
    const {
        globalPopup: { open: openGlobalPopup },
    } = useContext(AppStateContext);

    const dispatch = useAppDispatch();

    const aprPercentageString = aprPercentage
        ? `Est. APR | ${aprPercentage.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })}%`
        : '…';
    // JSX frag for estimated APR of position

    const apr = (
        <span className={styles.apr}>
            {aprPercentageString}{' '}
            <AiOutlineQuestionCircle
                size={14}
                onClick={() =>
                    openGlobalPopup(
                        <AprExplanation />,

                        'Estimated APR',
                        'right',
                    )
                }
            />
        </span>
    );

    const [tokenAMainnetPrice, setTokenAMainnetPrice] = useState<
        number | undefined
    >();
    const [tokenBMainnetPrice, setTokenBMainnetPrice] = useState<
        number | undefined
    >();

    const [userFlippedMaxMinDisplay, setUserFlippedMaxMinDisplay] =
        useState<boolean>(false);

    const [poolPriceUsdEquivalent, setPoolPriceUsdEquivalent] =
        useState<string>('');

    const [minPriceUsdEquivalent, setMinPriceUsdEquivalent] =
        useState<string>('');

    const [maxPriceUsdEquivalent, setMaxPriceUsdEquivalent] =
        useState<string>('');

    const tokenAAddress = tokenPair?.dataTokenA?.address;
    const tokenBAddress = tokenPair?.dataTokenB?.address;

    const minPrice = userFlippedMaxMinDisplay
        ? isAmbient
            ? '$0'
            : minPriceUsdEquivalent
        : isAmbient
        ? '0'
        : pinnedDisplayPrices
        ? pinnedDisplayPrices.pinnedMinPriceDisplayTruncatedWithCommas
        : '...';

    const maxPrice = userFlippedMaxMinDisplay
        ? isAmbient
            ? '$∞'
            : maxPriceUsdEquivalent
        : isAmbient
        ? '∞'
        : pinnedDisplayPrices
        ? pinnedDisplayPrices.pinnedMaxPriceDisplayTruncatedWithCommas
        : '...';

    const isDenomTokenA =
        (isDenomBase && isTokenABase) || (!isDenomBase && !isTokenABase);

    const pinnedMinPrice = pinnedDisplayPrices?.pinnedMinPriceDisplay;
    const pinnedMaxPrice = pinnedDisplayPrices?.pinnedMaxPriceDisplay;

    const currentPrice = userFlippedMaxMinDisplay
        ? poolPriceUsdEquivalent
        : poolPriceCharacter + spotPriceDisplay;

    const isStableTokenA = useMemo(
        () => isStableToken(tokenAAddress, chainId),
        [tokenAAddress, chainId],
    );

    const isStableTokenB = useMemo(
        () => isStableToken(tokenBAddress, chainId),
        [tokenBAddress, chainId],
    );

    const isEitherTokenStable = isStableTokenA || isStableTokenB;

    const updatePoolPriceUsdEquivalent = () => {
        const spotPriceNum = parseFloat(spotPriceDisplay.replaceAll(',', ''));

        if (!tokenBMainnetPrice || !tokenAMainnetPrice) return;

        let poolPriceNum;

        if (isDenomTokenA) {
            poolPriceNum = spotPriceNum * tokenBMainnetPrice;
        } else {
            poolPriceNum = spotPriceNum * tokenAMainnetPrice;
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
        setPoolPriceUsdEquivalent('~$' + displayUsdPriceString);
    };

    useEffect(() => {
        updatePoolPriceUsdEquivalent();
    }, [
        spotPriceDisplay,
        isDenomTokenA,
        tokenAMainnetPrice,
        tokenBMainnetPrice,
        tokenAAddress + tokenBAddress,
    ]);

    const updateMainnetPricesAsync = async () => {
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
        }
    };

    useEffect(() => {
        setUserFlippedMaxMinDisplay(false);

        updateMainnetPricesAsync();
    }, [tokenAAddress + tokenBAddress, isDenomTokenA]);

    useEffect(() => {
        if (!pinnedMinPrice || !pinnedMaxPrice) return;

        let minPriceNum, maxPriceNum;

        if (isDenomTokenA) {
            minPriceNum =
                parseFloat(pinnedMinPrice) * (tokenBMainnetPrice || 0);

            maxPriceNum =
                parseFloat(pinnedMaxPrice) * (tokenBMainnetPrice || 0);
        } else {
            minPriceNum =
                parseFloat(pinnedMinPrice) * (tokenAMainnetPrice || 0);

            maxPriceNum =
                parseFloat(pinnedMaxPrice) * (tokenAMainnetPrice || 0);
        }

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
        isDenomTokenA,
        tokenBMainnetPrice,
        tokenAMainnetPrice,
    ]);

    const handleMinMaxPriceClick = () => {
        setUserFlippedMaxMinDisplay(!userFlippedMaxMinDisplay);
    };

    // JSX frag for lowest price in range

    const denomTokenDollarEquivalentExists = isDenomTokenA
        ? tokenAMainnetPrice !== undefined
        : tokenBMainnetPrice !== undefined;

    const nonDenomTokenDollarEquivalentExists = !isDenomTokenA
        ? tokenAMainnetPrice !== undefined
        : tokenBMainnetPrice !== undefined;

    const minimumPrice =
        denomTokenDollarEquivalentExists && !isEitherTokenStable ? (
            <DefaultTooltip
                interactive
                title={`${minPriceUsdEquivalent} USD per ${
                    isDenomBase ? baseToken.symbol : quoteToken.symbol
                } `}
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
                    <span className={styles.min_price}>{minPrice}</span>
                </div>
            </DefaultTooltip>
        ) : (
            <div className={styles.price_display} style={{ cursor: 'default' }}>
                <h4 className={styles.price_title}>Min Price</h4>
                <span className={styles.min_price}>{minPrice}</span>
            </div>
        );

    // JSX frag for highest price in range
    const maximumPrice =
        nonDenomTokenDollarEquivalentExists && !isEitherTokenStable ? (
            <DefaultTooltip
                interactive
                title={`${maxPriceUsdEquivalent} USD per ${
                    isDenomBase ? baseToken.symbol : quoteToken.symbol
                } `}
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
                    <span className={styles.max_price}>{maxPrice}</span>
                </div>
            </DefaultTooltip>
        ) : (
            <div className={styles.price_display} style={{ cursor: 'default' }}>
                <h4 className={styles.price_title}>Max Price</h4>
                <span className={styles.max_price}>{maxPrice}</span>
            </div>
        );

    // JSX frag for current pool price
    const currentPoolPrice =
        nonDenomTokenDollarEquivalentExists && !isEitherTokenStable ? (
            <DefaultTooltip
                interactive
                title={`${poolPriceUsdEquivalent} USD per ${
                    isDenomBase ? baseToken.symbol : quoteToken.symbol
                } `}
                placement={'bottom'}
                arrow
                enterDelay={100}
                leaveDelay={200}
            >
                <div className={styles.price_display}>
                    <h4 className={styles.price_title}>Current Price</h4>
                    <span
                        className={styles.current_price}
                        onClick={() => {
                            dispatch(toggleDidUserFlipDenom());
                            setUserFlippedMaxMinDisplay(false);
                        }}
                    >
                        {currentPrice === 'Infinity' || !currentPrice
                            ? '…'
                            : `${currentPrice}`}
                    </span>
                </div>
            </DefaultTooltip>
        ) : (
            <div className={styles.price_display}>
                <h4 className={styles.price_title}>Current Price</h4>
                <span
                    className={styles.current_price}
                    onClick={() => {
                        dispatch(toggleDidUserFlipDenom());
                        setUserFlippedMaxMinDisplay(false);
                    }}
                >
                    {currentPrice === 'Infinity' || !currentPrice
                        ? '…'
                        : `${currentPrice}`}
                </span>
            </div>
        );

    return (
        <div className={styles.price_info_container}>
            {apr}
            <div className={styles.price_info_content}>
                {minimumPrice}
                {currentPoolPrice}
                {maximumPrice}
            </div>
        </div>
    );
}

export default memo(RangePriceInfo);
