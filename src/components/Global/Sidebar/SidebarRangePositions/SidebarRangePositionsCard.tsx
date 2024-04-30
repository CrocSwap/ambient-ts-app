import { PositionIF } from '../../../../ambient-utils/types';
import {
    getFormattedNumber,
    getMoneynessRankByAddr,
    getSymbols,
    getUnicodeCharacter,
} from '../../../../ambient-utils/dataLayer';
import { RangeItemContainer } from '../../../../styled/Components/Sidebar';
import { FlexContainer } from '../../../../styled/Common';
import { Status } from '../../../../styled/Components/Range';
import { useContext } from 'react';
import { PoolContext } from '../../../../contexts/PoolContext';

interface propsIF {
    position: PositionIF;
    handleClick: (pos: PositionIF) => void;
}

export default function SidebarRangePositionsCard(props: propsIF) {
    const { position, handleClick } = props;
    const { isTradeDollarizationEnabled } = useContext(PoolContext);

    const baseTokenMoneyness = getMoneynessRankByAddr(position.base);
    const quoteTokenMoneyness = getMoneynessRankByAddr(position.quote);

    const isDenomBase = baseTokenMoneyness < quoteTokenMoneyness;

    // human-readable string showing the tokens in the pool
    const pair = getSymbols(
        isDenomBase,
        position.baseSymbol,
        position.quoteSymbol,
    );

    // human-readable string indicating the range display
    const baseTokenCharacter = position?.baseSymbol
        ? getUnicodeCharacter(position?.baseSymbol)
        : '';
    const quoteTokenCharacter = position?.quoteSymbol
        ? getUnicodeCharacter(position?.quoteSymbol)
        : '';

    const formattedLowUsdPrice = position.isBaseTokenMoneynessGreaterOrEqual
        ? position.baseUsdPrice
            ? getFormattedNumber({
                  value:
                      position.bidTickPriceDecimalCorrected *
                      position.baseUsdPrice,
                  prefix: '$',
              })
            : '...'
        : position.quoteUsdPrice
        ? getFormattedNumber({
              value:
                  position.bidTickInvPriceDecimalCorrected *
                  position.quoteUsdPrice,
              prefix: '$',
          })
        : '...';

    const formattedHighUsdPrice = position.isBaseTokenMoneynessGreaterOrEqual
        ? position.baseUsdPrice
            ? getFormattedNumber({
                  value:
                      position.askTickPriceDecimalCorrected *
                      position.baseUsdPrice,
                  prefix: '$',
              })
            : '...'
        : position.quoteUsdPrice
        ? getFormattedNumber({
              value:
                  position.askTickInvPriceDecimalCorrected *
                  position.quoteUsdPrice,
              prefix: '$',
          })
        : '...';

    const rangeDisplayUsd = `${formattedLowUsdPrice}-${formattedHighUsdPrice}`;

    const rangeDisplay = isTradeDollarizationEnabled
        ? rangeDisplayUsd
        : position?.positionType === 'ambient'
        ? 'ambient'
        : isDenomBase
        ? `${quoteTokenCharacter}${position?.lowRangeDisplayInBase}-${quoteTokenCharacter}${position?.highRangeDisplayInBase}`
        : `${baseTokenCharacter}${position?.lowRangeDisplayInQuote}-${baseTokenCharacter}${position?.highRangeDisplayInQuote}`;

    // human-readable string showing total value of the position
    const value = getFormattedNumber({
        value: position.totalValueUSD,
        prefix: '$',
    });

    return (
        <RangeItemContainer
            numCols={4}
            color='text2'
            onClick={() => handleClick(position)}
        >
            {[pair, rangeDisplay, value].map((item) => (
                <FlexContainer
                    key={item}
                    justifyContent='center'
                    alignItems='center'
                    padding='4px'
                >
                    {item}
                </FlexContainer>
            ))}
            <FlexContainer
                justifyContent='center'
                alignItems='center'
                padding='4px'
            >
                <Status
                    status={
                        position.positionType === 'ambient'
                            ? 'ambient'
                            : position.isPositionInRange
                            ? 'positive'
                            : 'negative'
                    }
                />
            </FlexContainer>
        </RangeItemContainer>
    );
}
