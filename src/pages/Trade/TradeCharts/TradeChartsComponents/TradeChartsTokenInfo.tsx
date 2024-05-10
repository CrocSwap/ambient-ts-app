import React, { memo, useContext } from 'react';

import { PoolContext } from '../../../../contexts/PoolContext';
import {
    getFormattedNumber,
    getUnicodeCharacter,
} from '../../../../ambient-utils/dataLayer';
import { FlexContainer } from '../../../../styled/Common';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import DropdownSearch from '../../../../components/Global/DropdownSearch/DropdownSearch';
import PoolData from './PoolData';

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

    const denomInBase = isDenomBase;

    const currencyCharacter = denomInBase
        ? // denom in a, return token b character
          getUnicodeCharacter(quoteToken.symbol)
        : // denom in b, return token a character
          getUnicodeCharacter(baseToken.symbol);

    const poolPriceDisplayWithDenom = poolPriceDisplay
        ? isDenomBase
            ? 1 / poolPriceDisplay
            : poolPriceDisplay
        : 0;

    const truncatedPoolPrice = getFormattedNumber({
        value: poolPriceDisplayWithDenom,
        abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
    });

    const poolPrice = isTradeDollarizationEnabled
        ? usdPrice
            ? getFormattedNumber({ value: usdPrice, prefix: '$' })
            : '…'
        : poolPriceDisplay === Infinity ||
          poolPriceDisplay === 0 ||
          poolPriceDisplay === undefined
        ? '…'
        : `${currencyCharacter}${truncatedPoolPrice}`;

    const poolPriceChangeString =
        poolPriceChangePercent === undefined ? '…' : poolPriceChangePercent;

    const poolDataProps = {
        poolPrice,
        poolPriceChangeString,
        isPoolPriceChangePositive,
        toggleDidUserFlipDenom,
    };
    return (
        <FlexContainer alignItems='center' gap={16}>
            <DropdownSearch />

            <PoolData {...poolDataProps} />
        </FlexContainer>
    );
}

export default memo(TradeChartsTokenInfo);
