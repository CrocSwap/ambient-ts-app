import { memo } from 'react';
import { PoolDataIF } from '../../../contexts/ExploreContext';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';
import { SortedPoolMethodsIF, useSortedPools } from './useSortedPools';
import TableHead from './TableHead';
import checkPoolForWETH from '../../../App/functions/checkPoolForWETH';
import { PoolIF } from '../../../ambient-utils/types';
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
import { useSortedDexTokens } from './useSortedDexTokens';
import { dexTokenData } from '../../../pages/Explore/useTokenStats';
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
    allPools: Array<PoolDataIF>;
    chainId: string;
}

function DexTokens(props: propsIF) {
    const { dexTokens, allPools, chainId } = props;

    const sorted = useSortedDexTokens(dexTokens);
    sorted.sorted.forEach((s) => console.log(s.tokenMeta));

    // logic to handle onClick navigation action
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');
    function goToMarket(tknA: string, tknB: string): void {
        linkGenMarket.navigate({
            chain: chainId,
            tokenA: tknA,
            tokenB: tknB,
        });
    }

    // logic to take raw pool list and sort them based on user input
    const sortedPools: SortedPoolMethodsIF = useSortedPools(allPools);

    // !important:  any changes to `sortable` values must be accompanied by an update
    // !important:  ... to the type definition `sortType` in `useSortedPools.ts`
    const dexTokensHeaderItems: HeaderItem[] = [
        {
            label: 'Name',
            hidden: false,
            align: 'left',
            responsive: 'sm',
            sortable: false,
        },
        {
            label: 'Symbol',
            hidden: false,
            align: 'right',
            responsive: 'sm',
            sortable: false,
        },
        {
            label: 'Volume',
            hidden: false,
            align: 'right',
            responsive: 'sm',
            sortable: true,
        },
        {
            label: 'TVL',
            hidden: false,
            align: 'right',
            responsive: 'lg',
            sortable: true,
        },
        {
            label: 'Fees',
            hidden: false,
            responsive: 'sm',
            align: 'right',
            sortable: false,
        },
    ];

    return (
        <FlexContainer fullHeight fullWidth>
            <ScrollableContainer>
                <ShadowBox>
                    <Table>
                        <TableHead
                            headerItems={dexTokensHeaderItems}
                            sortedPools={sortedPools}
                        />
                        <TableBody>
                            {sortedPools.pools.length ? (
                                sortedPools.pools
                                    .filter(
                                        (pool: PoolIF) =>
                                            !checkPoolForWETH(pool),
                                    )
                                    .map((pool: PoolDataIF, idx: number) => (
                                        <TokenRow
                                            key={JSON.stringify(pool) + idx}
                                            pool={pool}
                                            goToMarket={goToMarket}
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
