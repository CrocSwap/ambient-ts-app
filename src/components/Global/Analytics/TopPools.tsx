import { memo } from 'react';
import PoolRow from './PoolRow';
import { PoolDataIF } from '../../../contexts/ExploreContext';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';
import { SortedPoolMethodsIF, useSortedPools } from './useSortedPools';
import TableHead from './TableHead';
import checkPoolForWETH from '../../../App/functions/checkPoolForWETH';
import { PoolIF } from '../../../utils/interfaces/PoolIF';
import {
    FlexContainer,
    ScrollableContainer,
    ShadowBox,
    Table,
    TableBody,
} from './Analytics.styles';
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
    allPools: PoolDataIF[];
    chainId: string;
}

function TopPools(props: propsIF) {
    const { allPools, chainId } = props;

    // logic to handle onClick navigation action
    const linkGenMarket: linkGenMethodsIF = useLinkGen('pool');
    function goToMarket(tknA: string, tknB: string): void {
        linkGenMarket.navigate({
            chain: chainId,
            tokenA: tknA,
            tokenB: tknB,
        });
    }

    // logic to take raw pool list and sort them based on user input
    const sortedPools: SortedPoolMethodsIF = useSortedPools(allPools);

    // number of pools to show in the DOM
    const POOL_COUNT = 20;

    // !important:  any changes to `sortable` values must be accompanied by an update
    // !important:  ... to the type definition `sortType` in `useSortedPools.ts`
    const topPoolsHeaderItems: HeaderItem[] = [
        {
            label: 'Tokens',
            hidden: false,
            align: 'left',
            sortable: false,
            pxValue: 8,
        },
        {
            label: 'Pool',
            hidden: true,
            align: 'left',
            responsive: 'sm',
            sortable: false,
        },
        {
            label: 'Price',
            hidden: true,
            align: 'right',
            responsive: 'sm',
            sortable: false,
        },
        {
            label: 'TVL',
            hidden: true,
            align: 'right',
            responsive: 'sm',
            sortable: true,
        },
        { label: 'Volume', hidden: false, align: 'right', sortable: true },
        {
            label: 'Change',
            hidden: true,
            align: 'right',
            responsive: 'lg',
            sortable: true,
        },
        { label: '', hidden: false, align: 'right', sortable: false },
    ];

    return (
        <FlexContainer>
            <ScrollableContainer>
                <ShadowBox>
                    <Table>
                        <TableHead
                            headerItems={topPoolsHeaderItems}
                            sortedPools={sortedPools}
                        />

                        <TableBody>
                            {sortedPools.pools
                                .filter(
                                    (pool: PoolIF) =>
                                        !checkPoolForWETH(pool, chainId),
                                )
                                .slice(0, POOL_COUNT)
                                .map((pool: PoolDataIF, idx: number) => (
                                    <PoolRow
                                        key={JSON.stringify(pool) + idx}
                                        pool={pool}
                                        goToMarket={goToMarket}
                                    />
                                ))}
                        </TableBody>
                    </Table>
                </ShadowBox>
            </ScrollableContainer>
        </FlexContainer>
    );
}

export default memo(TopPools);
