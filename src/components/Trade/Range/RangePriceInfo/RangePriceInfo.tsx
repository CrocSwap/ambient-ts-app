// START: Import Local Files
import styles from './RangePriceInfo.module.css';
// import truncateDecimals from '../../../../utils/data/truncateDecimals';
// import makeCurrentPrice from './makeCurrentPrice';
import {
    // useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
// import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import { memo, useContext, useEffect, useMemo, useState } from 'react';
import { DefaultTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { isStableToken } from '../../../../utils/data/stablePairs';

import { AppStateContext } from '../../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';

// interface for component props
interface propsIF {
    spotPriceDisplay: string;
    aprPercentage: number | undefined;
    poolPriceCharacter: string;
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
    isAmbient: boolean;
}

// central react functional component
function RangePriceInfo(props: propsIF) {
    const {
        poolPriceCharacter,
        // aprPercentage,
        pinnedDisplayPrices,
        isTokenABase,
        isAmbient,
    } = props;
    const {
        // eslint-disable-next-line
        globalPopup: { open: openGlobalPopup },
    } = useContext(AppStateContext);
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const { isDenomBase, tokenA, tokenB, baseToken, quoteToken } =
        useAppSelector((state) => state.tradeData);

    const [tokenAPrice, setTokenAPrice] = useState<number | undefined>();
    const [tokenBPrice, setTokenBPrice] = useState<number | undefined>();

    const [userFlippedMaxMinDisplay, setUserFlippedMaxMinDisplay] =
        useState<boolean>(false);

    const [minPriceUsdEquivalent, setMinPriceUsdEquivalent] =
        useState<string>('');
    // eslint-disable-next-line
    const [maxPriceUsdEquivalent, setMaxPriceUsdEquivalent] =
        useState<string>('');

    const tokenAAddress = tokenA.address;
    const tokenBAddress = tokenB.address;

    const minPrice = userFlippedMaxMinDisplay
        ? isAmbient
            ? '$0'
            : minPriceUsdEquivalent
        : isAmbient
        ? '0'
        : pinnedDisplayPrices
        ? poolPriceCharacter +
          pinnedDisplayPrices.pinnedMinPriceDisplayTruncatedWithCommas
        : '...';

    const maxPrice = userFlippedMaxMinDisplay
        ? isAmbient
            ? '$∞'
            : maxPriceUsdEquivalent
        : isAmbient
        ? '∞'
        : pinnedDisplayPrices
        ? poolPriceCharacter +
          pinnedDisplayPrices.pinnedMaxPriceDisplayTruncatedWithCommas
        : '...';

    const isDenomTokenA =
        (isDenomBase && isTokenABase) || (!isDenomBase && !isTokenABase);

    const pinnedMinPrice = pinnedDisplayPrices?.pinnedMinPriceDisplay;
    const pinnedMaxPrice = pinnedDisplayPrices?.pinnedMaxPriceDisplay;

    const isStableTokenA = useMemo(
        () => isStableToken(tokenAAddress),
        [tokenAAddress, chainId],
    );

    const isStableTokenB = useMemo(
        () => isStableToken(tokenBAddress),
        [tokenBAddress, chainId],
    );

    const isEitherTokenStable = isStableTokenA || isStableTokenB;

    const updateMainnetPricesAsync = async () => {
        const tokenAPrice = await cachedFetchTokenPrice(tokenAAddress, chainId);

        const tokenBPrice = await cachedFetchTokenPrice(tokenBAddress, chainId);

        setTokenAPrice(tokenAPrice?.usdPrice);
        setTokenBPrice(tokenBPrice?.usdPrice);
    };

    useEffect(() => {
        setUserFlippedMaxMinDisplay(false);

        updateMainnetPricesAsync();
    }, [tokenAAddress + tokenBAddress, isDenomTokenA]);

    useEffect(() => {
        if (!pinnedMinPrice || !pinnedMaxPrice) return;

        let minPriceNum, maxPriceNum;

        if (isDenomTokenA) {
            minPriceNum = parseFloat(pinnedMinPrice) * (tokenBPrice || 0);

            maxPriceNum = parseFloat(pinnedMaxPrice) * (tokenBPrice || 0);
        } else {
            minPriceNum = parseFloat(pinnedMinPrice) * (tokenAPrice || 0);

            maxPriceNum = parseFloat(pinnedMaxPrice) * (tokenAPrice || 0);
        }

        const minDisplayUsdPriceString = getFormattedNumber({
            value: minPriceNum,
            zeroDisplay: '…',
            prefix: '~$',
        });
        setMinPriceUsdEquivalent(minDisplayUsdPriceString);

        const maxDisplayUsdPriceString = getFormattedNumber({
            value: maxPriceNum,
            zeroDisplay: '…',
            prefix: '~$',
        });
        setMaxPriceUsdEquivalent(maxDisplayUsdPriceString);
    }, [
        pinnedMinPrice,
        pinnedMaxPrice,
        userFlippedMaxMinDisplay,
        isDenomTokenA,
        tokenBPrice,
        tokenAPrice,
    ]);

    const handleMinMaxPriceClick = () => {
        setUserFlippedMaxMinDisplay(!userFlippedMaxMinDisplay);
    };

    // JSX frag for lowest price in range

    const denomTokenDollarEquivalentExists = isDenomTokenA
        ? tokenAPrice !== undefined
        : tokenBPrice !== undefined;

    const nonDenomTokenDollarEquivalentExists = !isDenomTokenA
        ? tokenAPrice !== undefined
        : tokenBPrice !== undefined;

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
                    <span id='min_price_readable' className={styles.min_price}>
                        {minPrice}
                    </span>
                </div>
            </DefaultTooltip>
        ) : (
            <div className={styles.price_display} style={{ cursor: 'default' }}>
                <h4 className={styles.price_title}>Min Price</h4>
                <span id='min_price_readable' className={styles.min_price}>
                    {minPrice}
                </span>
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
                    <span id='max_price_readable' className={styles.max_price}>
                        {maxPrice}
                    </span>
                </div>
            </DefaultTooltip>
        ) : (
            <div className={styles.price_display} style={{ cursor: 'default' }}>
                <h4 className={styles.price_title}>Max Price</h4>
                <span id='max_price_readable' className={styles.max_price}>
                    {maxPrice}
                </span>
            </div>
        );

    // TODO: remove unnecessary top-level wrapper

    return (
        <div className={styles.price_info_container}>
            <div className={styles.price_info_content}>
                {/* {aprDisplay} */}
                {minimumPrice}
                {maximumPrice}
            </div>
        </div>
    );
}

export default memo(RangePriceInfo);
