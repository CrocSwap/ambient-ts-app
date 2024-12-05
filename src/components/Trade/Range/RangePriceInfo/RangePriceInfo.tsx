import { memo, useContext, useEffect, useState } from 'react';
import { getFormattedNumber } from '../../../../ambient-utils/dataLayer';
import styles from './RangePriceInfo.module.css';

import { AppStateContext } from '../../../../contexts/AppStateContext';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../../contexts/PoolContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';

// interface for component props
interface propsIF {
    spotPriceDisplay: string;
    // aprPercentage: number | undefined;
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
        isAmbient,
    } = props;
    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);
    const {
        isTradeDollarizationEnabled,
        setIsTradeDollarizationEnabled,
        poolPriceDisplay,
    } = useContext(PoolContext);
    const { crocEnv } = useContext(CrocEnvContext);

    const { isDenomBase, baseToken, quoteToken } = useContext(TradeDataContext);

    const [basePrice, setBasePrice] = useState<number | undefined>();
    const [quotePrice, setQuotePrice] = useState<number | undefined>();

    const [userFlippedMaxMinDisplay, setUserFlippedMaxMinDisplay] =
        useState<boolean>(false);

    const [minPriceUsdEquivalent, setMinPriceUsdEquivalent] =
        useState<string>('');
    // eslint-disable-next-line
    const [maxPriceUsdEquivalent, setMaxPriceUsdEquivalent] =
        useState<string>('');

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

    const pinnedMinPrice = pinnedDisplayPrices?.pinnedMinPriceDisplayTruncated;
    const pinnedMaxPrice = pinnedDisplayPrices?.pinnedMaxPriceDisplayTruncated;

    const updateMainnetPricesAsync = async () => {
        if (!crocEnv) return;
        const baseTokenPrice =
            (await cachedFetchTokenPrice(baseToken.address, chainId, crocEnv))
                ?.usdPrice || 0;

        const quoteTokenPrice =
            (await cachedFetchTokenPrice(quoteToken.address, chainId, crocEnv))
                ?.usdPrice || 0;

        if (baseTokenPrice) {
            setBasePrice(baseTokenPrice);
        } else if (quoteTokenPrice && poolPriceDisplay) {
            // this may be backwards
            const estimatedBasePrice = quoteTokenPrice / poolPriceDisplay;
            setBasePrice(estimatedBasePrice);
        }
        if (quoteTokenPrice) {
            setQuotePrice(quoteTokenPrice);
        } else if (baseTokenPrice && poolPriceDisplay) {
            const estimatedQuotePrice = baseTokenPrice * poolPriceDisplay;
            setQuotePrice(estimatedQuotePrice);
        }
    };

    useEffect(() => {
        setUserFlippedMaxMinDisplay(false);

        updateMainnetPricesAsync();
    }, [
        crocEnv !== undefined,
        baseToken.address + quoteToken.address,
        poolPriceDisplay,
    ]);

    useEffect(() => {
        if (!pinnedMinPrice || !pinnedMaxPrice) return;

        let minPriceNum, maxPriceNum;

        if (isDenomBase) {
            minPriceNum = parseFloat(pinnedMinPrice) * (quotePrice || 0);

            maxPriceNum = parseFloat(pinnedMaxPrice) * (quotePrice || 0);
        } else {
            minPriceNum = parseFloat(pinnedMinPrice) * (basePrice || 0);

            maxPriceNum = parseFloat(pinnedMaxPrice) * (basePrice || 0);
        }

        const minDisplayUsdPriceString = isAmbient
            ? '$0'
            : getFormattedNumber({
                  value: minPriceNum,
                  zeroDisplay: '…',
                  prefix: '$',
              });
        setMinPriceUsdEquivalent(minDisplayUsdPriceString);

        const maxDisplayUsdPriceString = isAmbient
            ? '$∞'
            : getFormattedNumber({
                  value: maxPriceNum,
                  zeroDisplay: '…',
                  prefix: '$',
              });
        setMaxPriceUsdEquivalent(maxDisplayUsdPriceString);
    }, [
        pinnedMinPrice,
        pinnedMaxPrice,
        isDenomBase,
        basePrice,
        quotePrice,
        isAmbient,
    ]);

    // JSX frag for lowest price in range

    const nonDenomTokenDollarEquivalentExists = !isDenomBase
        ? quotePrice !== undefined
        : basePrice !== undefined;

    const minimumPrice = nonDenomTokenDollarEquivalentExists ? (
        <div className={styles.price_display}>
            <h4 className={styles.price_title}>Min Price</h4>
            <span id='min_price_readable' className={styles.min_price}>
                {isTradeDollarizationEnabled ? minPriceUsdEquivalent : minPrice}
            </span>
        </div>
    ) : (
        <div className={styles.price_display} style={{ cursor: 'default' }}>
            <h4 className={styles.price_title}>Min Price</h4>
            <span id='min_price_readable' className={styles.min_price}>
                {minPrice}
            </span>
        </div>
    );

    // JSX frag for highest price in range
    const maximumPrice = nonDenomTokenDollarEquivalentExists ? (
        <div className={styles.price_display}>
            <h4 className={styles.price_title}>Max Price</h4>
            <span id='max_price_readable' className={styles.max_price}>
                {isTradeDollarizationEnabled ? maxPriceUsdEquivalent : maxPrice}
            </span>
        </div>
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
        <div
            className={styles.price_info_container}
            // below needed to prevent an area between the two price displays from having different cursor
            style={{ cursor: 'pointer' }}
            onClick={() => setIsTradeDollarizationEnabled((prev) => !prev)}
        >
            <div className={styles.price_info_content}>
                {/* {aprDisplay} */}
                {minimumPrice}
                {maximumPrice}
            </div>
        </div>
    );
}

export default memo(RangePriceInfo);
