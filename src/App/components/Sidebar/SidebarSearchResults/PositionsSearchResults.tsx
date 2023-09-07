import { PositionIF } from '../../../../utils/interfaces/exports';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useContext } from 'react';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../utils/hooks/useLinkGen';
import { getFormattedNumber } from '../../../functions/getFormattedNumber';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { FlexContainer, GridContainer, Text } from '../../../../styled/Common';
import {
    Results,
    ResultsContainer,
} from '../../../../styled/Components/Sidebar';

interface propsIF {
    searchedPositions: PositionIF[];
}
interface PositionLiPropsIF {
    position: PositionIF;
    handleClick: (position: PositionIF) => void;
}

function PositionLI(props: PositionLiPropsIF) {
    const { position, handleClick } = props;
    const { isDenomBase } = useAppSelector((state) => state.tradeData);

    const getRangeDisplay = (position: PositionIF, isDenomBase: boolean) => {
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
                ? `${quoteTokenCharacter}${position?.lowRangeShortDisplayInBase}-${quoteTokenCharacter}${position?.highRangeShortDisplayInBase}`
                : `${baseTokenCharacter}${position?.lowRangeShortDisplayInQuote}-${baseTokenCharacter}${position?.highRangeShortDisplayInQuote}`;

        return rangeDisplay;
    };

    // fn to generate human-readable range output (from X to Y)
    const rangeDisplay = getRangeDisplay(position, isDenomBase);

    // fn to generate human-readable version of total position value
    const positionValue = getFormattedNumber({
        value: position.totalValueUSD,
    });

    return (
        <Results
            numCols={3}
            fullWidth
            fontWeight='300'
            fontSize='body'
            color='text2'
            padding='4px'
            onClick={() => handleClick(position)}
        >
            <p>
                {isDenomBase
                    ? `${position?.baseSymbol} / ${position?.quoteSymbol}`
                    : `${position?.quoteSymbol} / ${position?.baseSymbol}`}
            </p>
            <p style={{ textAlign: 'center' }}>{rangeDisplay}</p>
            <p style={{ textAlign: 'center' }}>{'$' + positionValue}</p>
        </Results>
    );
}

export default function PositionsSearchResults(props: propsIF) {
    const { searchedPositions } = props;

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const {
        setCurrentPositionActive,
        setShowAllData,
        setOutsideControl,
        setSelectedOutsideTab,
    } = useContext(TradeTableContext);

    // hook to generate navigation actions with pre-loaded path
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    const handleClick = (position: PositionIF): void => {
        setOutsideControl(true);
        setSelectedOutsideTab(2);
        setCurrentPositionActive(position.lastMintTx);
        setShowAllData(false);
        const { base, quote, bidTick, askTick } = position;
        linkGenPool.navigate({
            chain: chainId,
            tokenA: base,
            tokenB: quote,
            lowTick: bidTick,
            highTick: askTick,
        });
    };

    return (
        <FlexContainer
            flexDirection='column'
            justifyContent='center'
            alignItems='flex-start'
            gap={8}
        >
            <Text fontWeight='500' fontSize='body' color='accent5'>
                My Range Positions
            </Text>
            {searchedPositions.length ? (
                <FlexContainer flexDirection='column' fullWidth>
                    <GridContainer
                        numCols={3}
                        fullWidth
                        fontWeight='300'
                        fontSize='body'
                        color='text2'
                        style={{ borderBottom: '1px solid var(--dark3)' }}
                        padding='0 0 4px 0'
                    >
                        {['Pool', 'Range', 'Value'].map((item, idx) => (
                            <Text
                                key={idx}
                                fontWeight='300'
                                fontSize='body'
                                color='text2'
                                align='center'
                            >
                                {item}
                            </Text>
                        ))}
                    </GridContainer>
                    <ResultsContainer flexDirection='column'>
                        {searchedPositions
                            .slice(0, 4)
                            .map((position: PositionIF) => (
                                <PositionLI
                                    key={`PositionSearchResult_${JSON.stringify(
                                        position,
                                    )}`}
                                    position={position}
                                    handleClick={handleClick}
                                />
                            ))}
                    </ResultsContainer>
                </FlexContainer>
            ) : (
                <FlexContainer
                    margin='0 8px 96px 8px'
                    fontSize='body'
                    color='text2'
                >
                    No Ranges Found
                </FlexContainer>
            )}
        </FlexContainer>
    );
}
