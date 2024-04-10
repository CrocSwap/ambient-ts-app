import { memo } from 'react';
import PoolRow from './PoolRow';
import { PoolDataIF } from '../../../contexts/ExploreContext';
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
import { useMediaQuery } from '@material-ui/core';
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
    allPools: Array<PoolDataIF>;
    goToMarket: (tknA: string, tknB: string) => void;
    isExploreDollarizationEnabled: boolean;
}

function TopPools(props: propsIF) {
    const { allPools, goToMarket, isExploreDollarizationEnabled } = props;

    // logic to take raw pool list and sort them based on user input
    const sortedPools: SortedPoolMethodsIF = useSortedPools(allPools);
    const showMobileVersion = useMediaQuery('(max-width: 500px)');

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
            hidden: false,
            align: 'right',
            responsive: 'sm',
            sortable: false,
        },
        { label: '24h Vol.', hidden: false, align: 'right', sortable: true },
        {
            label: 'TVL',
            hidden: false,
            align: 'right',
            responsive: 'sm',
            sortable: true,
        },
        {
            label: '24h Price Δ',
            hidden: true,
            align: 'right',
            responsive: 'lg',
            sortable: true,
        },
        {
            label: '',
            hidden: true,
            responsive: 'sm',
            align: 'right',
            sortable: false,
        },
    ];

    return (
        <FlexContainer
            fullWidth
            height={
                showMobileVersion
                    ? 'calc(100svh - 240px)'
                    : 'calc(100svh - 200px)'
            }
            // height={showMobileVersion ? '85%' : 'calc(100vh - 220px)'}
        >
            <ScrollableContainer>
                <ShadowBox>
                    <Table>
                        <TableHead
                            headerItems={topPoolsHeaderItems}
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
                                        <PoolRow
                                            key={JSON.stringify(pool) + idx}
                                            pool={pool}
                                            goToMarket={goToMarket}
                                            isExploreDollarizationEnabled={
                                                isExploreDollarizationEnabled
                                            }
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

export default memo(TopPools);
