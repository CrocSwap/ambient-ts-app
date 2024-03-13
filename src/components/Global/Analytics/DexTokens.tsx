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
import { GCServerPoolIF, TokenIF } from '../../../ambient-utils/types';
import { PoolContext } from '../../../contexts/PoolContext';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { usePoolList2 } from '../../../App/hooks/usePoolList2';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

export type columnSlugs =
    | 'token'
    | 'name'
    | 'tvl'
    | 'fees'
    | 'volume'
    | 'tradeBtn';

export interface HeaderItem {
    label: string;
    slug: columnSlugs;
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

    // this logic is here to patch cases where existing logic to identify a token pool fails,
    // ... this is not an optimal location but works as a stopgap that minimizes needing to
    // ... alter existing logic or type annotation in the component tree
    const { crocEnv, activeNetwork } = useContext(CrocEnvContext);
    const unfilteredPools: GCServerPoolIF[] = usePoolList2(
        activeNetwork.graphCacheUrl,
        crocEnv,
    );

    const dexTokensHeaderItems: HeaderItem[] = [
        {
            label: 'Token',
            slug: 'token',
            hidden: false,
            align: 'left',
            responsive: 'sm',
            sortable: false,
        },
        {
            label: 'Name',
            slug: 'name',
            hidden: smallScreen,
            align: 'left',
            responsive: 'sm',
            sortable: true,
        },
        {
            label: 'TVL',
            slug: 'tvl',
            hidden: false,
            align: 'right',
            responsive: 'sm',
            sortable: true,
        },
        {
            label: 'Fees',
            slug: 'fees',
            hidden: false,
            align: 'right',
            responsive: 'sm',
            sortable: true,
        },
        {
            label: 'Volume',
            slug: 'volume',
            hidden: false,
            align: 'right',
            responsive: 'lg',
            sortable: true,
        },
        {
            label: '',
            slug: 'tradeBtn',
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
                        <TableHeadTokens
                            headerItems={dexTokensHeaderItems}
                            updateSort={sortedTokens.update}
                        />
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
                                            ) ??
                                            findPool(token.tokenAddr)
                                        }
                                        backupPool={unfilteredPools.find(
                                            (p: GCServerPoolIF) =>
                                                p.base.toLowerCase() ===
                                                    token.tokenAddr.toLowerCase() ||
                                                p.quote.toLowerCase() ===
                                                    token.tokenAddr.toLowerCase(),
                                        )}
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
