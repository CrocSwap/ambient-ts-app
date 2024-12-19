import { memo, useContext, useMemo } from 'react';

import {
    getFormattedNumber,
    getUnicodeCharacter,
} from '../../../../../ambient-utils/dataLayer';
import DropdownSearch from '../../../../../components/Global/DropdownSearch/DropdownSearch';
import { PoolContext } from '../../../../../contexts/PoolContext';
import { TradeDataContext } from '../../../../../contexts/TradeDataContext';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import PoolData from './PoolData';
import styles from './TradeChartsTokenInfo.module.css';

function TradeChartsTokenInfo() {
    const { baseToken, quoteToken, isDenomBase } = useContext(TradeDataContext);

    const {
        poolPriceDisplay,
        isPoolPriceChangePositive,
        poolPriceChangePercent,
        usdPrice,
        isTradeDollarizationEnabled,
    } = useContext(PoolContext);

    const { toggleDidUserFlipDenom } = useContext(TradeDataContext);

    const currencyCharacter = useMemo(
        () =>
            isDenomBase
                ? // denom in a, return token b character
                  getUnicodeCharacter(quoteToken.symbol)
                : // denom in b, return token a character
                  getUnicodeCharacter(baseToken.symbol),
        [isDenomBase, baseToken, quoteToken],
    );

    const poolPriceDisplayWithDenom = useMemo(
        () =>
            poolPriceDisplay
                ? isDenomBase
                    ? 1 / poolPriceDisplay
                    : poolPriceDisplay
                : 0,
        [poolPriceDisplay, isDenomBase],
    );

    const truncatedPoolPrice = useMemo(
        () =>
            getFormattedNumber({
                value: poolPriceDisplayWithDenom,
                abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
            }),
        [poolPriceDisplayWithDenom],
    );

    const poolPrice = useMemo(
        () =>
            isTradeDollarizationEnabled
                ? usdPrice
                    ? getFormattedNumber({ value: usdPrice, prefix: '$' })
                    : '…'
                : poolPriceDisplay === Infinity ||
                    poolPriceDisplay === 0 ||
                    poolPriceDisplay === undefined
                  ? '…'
                  : `${currencyCharacter}${truncatedPoolPrice}`,
        [
            isTradeDollarizationEnabled,
            usdPrice,
            poolPriceDisplay,
            truncatedPoolPrice,
            currencyCharacter,
        ],
    );

    const poolPriceChangeString = useMemo(
        () =>
            poolPriceChangePercent === undefined ? '…' : poolPriceChangePercent,
        [poolPriceChangePercent],
    );

    const poolDataProps = {
        poolPrice,
        poolPriceChangeString,
        isPoolPriceChangePositive,
        toggleDidUserFlipDenom,
    };

    const smallScreen = useMediaQuery('(min-width: 768px)');

    return (
        <div className={styles.container}>
            <div className={styles.dropdownContainer}>
                <DropdownSearch />
            </div>

            {smallScreen && <PoolData {...poolDataProps} />}
        </div>
    );
}

export default memo(TradeChartsTokenInfo);
