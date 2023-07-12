import { memo } from 'react';
import PoolRow from './PoolRow';
import { PoolDataIF } from '../../../contexts/AnalyticsContext';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';
import { SortedPoolMethodsIF, useSortedPools } from './useSortedPools';
import styled from 'styled-components';
import TableHead from './TableHead';
import checkPoolForWETH from '../../../App/functions/checkPoolForWETH';
import { PoolIF } from '../../../utils/interfaces/PoolIF';

type HeaderItem = {
    label: string;
    hidden: boolean;
    align: string;
    responsive?: string;
    sortable: boolean;
    pxValue?: number;
    onClick?: () => void;
};

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

    const sortedPools: SortedPoolMethodsIF = useSortedPools(allPools);

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
            align: 'right',
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
        {
            label: 'APR',
            hidden: true,
            align: 'right',
            responsive: 'xl',
            sortable: true,
        },
        { label: 'Volume', hidden: false, align: 'right', sortable: true },
        {
            label: 'Change',
            hidden: true,
            align: 'right',
            responsive: 'lg',
            sortable: false,
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
                                .slice(0, 20)
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

// Main container
const FlexContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const ScrollableContainer = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    height: 100%;
    scrollbar-width: thin;
    scrollbar-color: var(--dark3) var(--dark1);

    &::-webkit-scrollbar {
        display: 'none';
    }

    &::-webkit-scrollbar-track {
        background-color: var(--dark1);
    }

    &::-webkit-scrollbar-thumb {
        background-color: var(--dark3);
    }
`;

const ShadowBox = styled.div`
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-radius: 0.375rem;
    background-color: var(--dark1);
    height: 100%;

    position: relative;

    padding: 8px;
`;

const Table = styled.table`
    border-collapse: collapse;
    width: 100%;
    table-layout: fixed;

    @media only screen and (min-width: 1280px) {
        td,
        th {
            min-width: 180px;
        }
    }
`;

const TableBody = styled.tbody`
    background-color: var(--dark1);
    color: var(--white);
    font-size: 12px;
    font-family: 'Roboto', sans-serif;
    text-transform: capitalize;
    line-height: 1.5rem;
    overflow-y: auto;
    max-height: 96px;
`;
