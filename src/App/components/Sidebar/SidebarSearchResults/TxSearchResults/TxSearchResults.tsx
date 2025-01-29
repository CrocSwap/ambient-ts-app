import { useContext } from 'react';
import { TransactionIF } from '../../../../../ambient-utils/types';
import { AppStateContext } from '../../../../../contexts';
import { SidebarContext } from '../../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import {
    FlexContainer,
    GridContainer,
    Text,
} from '../../../../../styled/Common';
import { ResultsContainer } from '../../../../../styled/Components/Sidebar';
import {
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../../utils/hooks/useLinkGen';
import TxLI from './TxLI';

interface propsIF {
    searchedTxs: TransactionIF[];
}

export default function TxSearchResults(props: propsIF) {
    const { searchedTxs } = props;
    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const { isPoolDropdownOpen, setIsPoolDropdownOpen } =
        useContext(SidebarContext);

    const {
        setCurrentTxActiveInTransactions,
        setShowAllData,
        setOutsideControl,
        setSelectedOutsideTab,
    } = useContext(TradeTableContext);

    // hook to generate navigation actions with pre-loaded path
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');

    const handleClick = (tx: TransactionIF): void => {
        if (isPoolDropdownOpen) {
            setIsPoolDropdownOpen(false);
        }
        setOutsideControl(true);
        setSelectedOutsideTab(0);
        setShowAllData(false);
        setCurrentTxActiveInTransactions(tx.txId);
        linkGenMarket.navigate(
            tx.isBuy
                ? {
                      chain: chainId,
                      tokenA: tx.base,
                      tokenB: tx.quote,
                  }
                : {
                      chain: chainId,
                      tokenA: tx.quote,
                      tokenB: tx.base,
                  },
        );
    };

    // TODO:   @Junior  please refactor the header <div> as a <header> element
    // TODO:   @Junior  also make the <div> elems inside it into <hX> elements

    return (
        <FlexContainer
            flexDirection='column'
            justifyContent='center'
            alignItems='flex-start'
            gap={8}
        >
            <Text fontWeight='500' fontSize='body' color='accent5'>
                My Recent Transactions
            </Text>
            {searchedTxs.length ? (
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
                        {['Pool', 'Type', 'Value'].map((item, idx) => (
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
                        {searchedTxs.slice(0, 4).map((tx: TransactionIF) => (
                            <TxLI
                                key={`tx-sidebar-search-result-${JSON.stringify(
                                    tx,
                                )}`}
                                tx={tx}
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
                    No Transactions Found
                </FlexContainer>
            )}
        </FlexContainer>
    );
}
