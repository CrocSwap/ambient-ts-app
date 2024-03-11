import { memo, useContext } from 'react';
import Spinner from '../Spinner/Spinner';
import {
    ScrollableContainer,
    ShadowBox,
    SpinnerContainer,
    Table,
    TableBody,
} from '../../../styled/Components/Analytics';
import { FlexContainer } from '../../../styled/Common';
import TokenRow from './TokenRow';
import { useSortedDexTokens, sortedDexTokensIF } from './useSortedDexTokens';
import { dexTokenData } from '../../../pages/Explore/useTokenStats';
import TableHeadTokens from './TableHeadTokens';
import { getDefaultPairForChain } from '../../../ambient-utils/constants';
import { TokenIF } from '../../../ambient-utils/types';
import { PoolContext } from '../../../contexts/PoolContext';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

export interface HeaderItem {
    label: string;
    hidden: boolean;
    align: string;
    responsive?: string;
    sortable: boolean;
    pxValue?: number;
    onClick?: () => void;
}

interface propsIF {
    dexTokens: dexTokenData[];
    chainId: string;
    goToMarket: (tknA: string, tknB: string) => void;
}

function DexTokens(props: propsIF) {
    const { dexTokens, chainId, goToMarket } = props;

    const { findPool } = useContext(PoolContext);

    const defaultTokensForChain: [TokenIF, TokenIF] =
        getDefaultPairForChain(chainId);

    const sortedTokens: sortedDexTokensIF = useSortedDexTokens(dexTokens);

    const smallScreen: boolean = useMediaQuery('(max-width: 800px)');

    const dexTokensHeaderItems: HeaderItem[] = [
        {
            label: 'Token',
            hidden: false,
            align: 'left',
            responsive: 'sm',
            sortable: false,
        },
        {
            label: 'Name',
            hidden: smallScreen,
            align: 'left',
            responsive: 'sm',
            sortable: false,
        },
        {
            label: 'TVL',
            hidden: false,
            align: 'right',
            responsive: 'sm',
            sortable: false,
        },
        {
            label: 'Fees',
            hidden: false,
            align: 'right',
            responsive: 'sm',
            sortable: false,
        },
        {
            label: 'Volume',
            hidden: false,
            align: 'right',
            responsive: 'lg',
            sortable: false,
        },
        {
            label: '',
            hidden: false,
            align: 'right',
            responsive: 'sm',
            sortable: false,
        },
    ];

    return (
        <FlexContainer fullHeight fullWidth>
            <ScrollableContainer>
                <ShadowBox>
                    <Table>
                        <TableHeadTokens headerItems={dexTokensHeaderItems} />
                        <TableBody>
                            {/* 
                                TODO:   change this logic to use React <Suspense />
                            */}
                            {sortedTokens.data.length ? (
                                sortedTokens.data.map((token: dexTokenData) => (
                                    <TokenRow
                                        key={JSON.stringify(token)}
                                        token={token}
                                        samplePool={
                                            findPool(
                                                token.tokenAddr,
                                                defaultTokensForChain[0],
                                            ) ??
                                            findPool(
                                                token.tokenAddr,
                                                defaultTokensForChain[1],
                                            )
                                        }
                                        goToMarket={goToMarket}
                                        smallScreen={smallScreen}
                                    />
                                ))
                            ) : (
                                <SpinnerContainer
                                    fullHeight
                                    fullWidth
                                    alignItems='center'
                                    justifyContent='center'
                                >
                                    <Spinner
                                        size={100}
                                        bg='var(--dark1)'
                                        centered
                                    />
                                </SpinnerContainer>
                            )}
                        </TableBody>
                    </Table>
                </ShadowBox>
            </ScrollableContainer>
        </FlexContainer>
    );
}

export default memo(DexTokens);
