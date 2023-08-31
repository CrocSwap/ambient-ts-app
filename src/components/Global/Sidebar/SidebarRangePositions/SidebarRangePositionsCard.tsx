import { PositionIF } from '../../../../utils/interfaces/exports';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';
import { getSymbols } from '../../../../App/functions/getSymbols';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { RangeItemContainer } from '../../../../styled/Components/Sidebar';
import { FlexContainer } from '../../../../styled/Common';
import { Status } from '../../../../styled/Components/Range';

interface propsIF {
    position: PositionIF;
    handleClick: (pos: PositionIF) => void;
}

export default function SidebarRangePositionsCard(props: propsIF) {
    const { position, handleClick } = props;
    const { isDenomBase } = useAppSelector((state) => state.tradeData);

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

    const rangeDisplay =
        position?.positionType === 'ambient'
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
