import { useContext } from 'react';
import {
    getFormattedNumber,
    getUnicodeCharacter,
} from '../../../../ambient-utils/dataLayer';
import { PositionIF } from '../../../../ambient-utils/types';
import { AppStateContext } from '../../../../contexts';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { FlexContainer, GridContainer, Text } from '../../../../styled/Common';
import {
    Results,
    ResultsContainer,
} from '../../../../styled/Components/Sidebar';
import {
    linkGenMethodsIF,
    poolParamsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';

interface propsIF {
    searchedPositions: PositionIF[];
}
interface PositionLiPropsIF {
    position: PositionIF;
    handleClick: (position: PositionIF) => void;
}

function PositionLI(props: PositionLiPropsIF) {
    const { position, handleClick } = props;
    const { isDenomBase } = useContext(TradeDataContext);

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
        prefix: '$',
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
            <p style={{ textAlign: 'center' }}>{positionValue}</p>
        </Results>
    );
}

export default function PositionsSearchResults(props: propsIF) {
    const { searchedPositions } = props;
    const { isPoolDropdownOpen, setIsPoolDropdownOpen } =
        useContext(SidebarContext);

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const {
        setCurrentPositionActive,
        setShowAllData,
        setOutsideControl,
        setSelectedOutsideTab,
    } = useContext(TradeTableContext);

    // hook to generate navigation actions with pre-loaded path
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    const handleClick = (position: PositionIF): void => {
        if (isPoolDropdownOpen) setIsPoolDropdownOpen(false);
        setOutsideControl(true);
        setSelectedOutsideTab(2);
        setCurrentPositionActive(position.positionId);
        setShowAllData(false);
        const { base, quote } = position;
        // URL params for link to pool page
        const poolLinkParams: poolParamsIF = {
            chain: chainId,
            tokenA: base,
            tokenB: quote,
        };
        // navigate user to `/trade/pool` with defined URL params
        linkGenPool.navigate(poolLinkParams);
    };

    return (
        <FlexContainer
            flexDirection='column'
            justifyContent='center'
            alignItems='flex-start'
            gap={8}
        >
            <Text fontWeight='500' fontSize='body' color='accent5'>
                My Liquidity Positions
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
