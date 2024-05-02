import React, { memo, useContext } from 'react';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';

import { PoolContext } from '../../../../contexts/PoolContext';
import TokenIcon from '../../../../components/Global/TokenIcon/TokenIcon';
import {
    getFormattedNumber,
    getUnicodeCharacter,
} from '../../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../../ambient-utils/types';
import { FlexContainer } from '../../../../styled/Common';
import { HeaderButtons, HeaderText } from '../../../../styled/Components/Chart';
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

    const [topToken, bottomToken]: [TokenIF, TokenIF] = denomInBase
        ? [baseToken, quoteToken]
        : [quoteToken, baseToken];

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

    const smallScrenView = useMediaQuery('(max-width: 968px)');

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

    const denomToggleButton = (
        <FlexContainer gap={8}>
            <HeaderButtons
                id='token_pair_in_chart_header'
                aria-label='flip denomination.'
                onClick={() => toggleDidUserFlipDenom()}
            >
                <FlexContainer
                    id='trade_chart_header_token_pair_logos'
                    role='button'
                    gap={8}
                >
                    <TokenIcon
                        token={topToken}
                        src={topToken.logoURI}
                        alt={topToken.symbol}
                        size={smallScrenView ? 's' : 'l'}
                    />
                    <TokenIcon
                        token={bottomToken}
                        src={bottomToken.logoURI}
                        alt={bottomToken.symbol}
                        size={smallScrenView ? 's' : 'l'}
                    />
                </FlexContainer>
                <HeaderText
                    id='trade_chart_header_token_pair_symbols'
                    fontSize='header1'
                    fontWeight='300'
                    color='text1'
                    role='button'
                    aria-live='polite'
                    aria-atomic='true'
                    aria-relevant='all'
                >
                    {topToken.symbol} / {bottomToken.symbol}
                </HeaderText>
            </HeaderButtons>
            <DropdownSearch />
        </FlexContainer>
    );

    const poolDataProps = {
        poolPrice,
        poolPriceChangeString,
        isPoolPriceChangePositive,
        toggleDidUserFlipDenom,
    };
    return (
        <FlexContainer alignItems='center' gap={16}>
            {denomToggleButton}

            <PoolData {...poolDataProps} />
        </FlexContainer>
    );
}

export default memo(TradeChartsTokenInfo);
