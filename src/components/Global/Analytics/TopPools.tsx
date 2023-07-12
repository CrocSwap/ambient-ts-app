import { memo } from 'react';
import PoolRow from './PoolRow';
import { PoolDataIF } from '../../../contexts/AnalyticsContext';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';
import {
    SortedPoolMethodsIF,
    sortType,
    useSortedPools,
} from './useSortedPools';
import styled from 'styled-components';

type HeaderItem = {
    label: string;
    hidden: boolean;
    align: string;
    responsive?: string;
    sortable: boolean;
    pxValue?: number;
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

    const TableHead = ({ headerItems }: { headerItems: HeaderItem[] }) => {
        return (
            <thead
                className='sticky top-0 h-25 '
                style={{
                    height: '25px',
                    zIndex: '2',
                    borderBottom: '1px solid red',
                }}
            >
                <tr className='text-text2 text-body font-regular capitalize leading-body'>
                    {headerItems.map((item, index) => (
                        <th
                            key={index}
                            scope='col'
                            className={`${item.hidden ? 'hidden' : ''} ${
                                item.responsive
                                    ? `${item.responsive}:table-cell`
                                    : ''
                            } sticky top-0 ${
                                item.pxValue ? `px-${item.pxValue}` : 'px-6'
                            } text-${item.align} tracking-wider ${
                                item.sortable
                                    ? 'hover:bg-dark2 cursor-pointer'
                                    : ''
                            }`}
                            onClick={() => {
                                item.sortable &&
                                    sortedPools.updateSort(
                                        item.label.toLowerCase() as sortType,
                                    );
                            }}
                        >
                            {item.label}
                        </th>
                    ))}
                </tr>
            </thead>
        );
    };

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
            align: 'left',
            responsive: 'sm',
            sortable: true,
        },
        {
            label: 'TVL',
            hidden: true,
            align: 'left',
            responsive: 'sm',
            sortable: true,
        },
        {
            label: 'APR',
            hidden: true,
            align: 'left',
            responsive: 'xl',
            sortable: true,
        },
        { label: 'Volume', hidden: false, align: 'left', sortable: true },
        {
            label: 'Change',
            hidden: true,
            align: 'left',
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
                        <TableHead headerItems={topPoolsHeaderItems} />

                        <TableBody>
                            {sortedPools.pools.map(
                                (pool: PoolDataIF, idx: number) => (
                                    // using index in key gen logic because there are duplicate
                                    // ... pool entries, we need to either filter out the dupes
                                    // ... (hacky but acceptable) or figure out why dupes are
                                    // ... being returned by PoolContext (preferable)
                                    <PoolRow
                                        key={JSON.stringify(pool) + idx}
                                        pool={pool}
                                        goToMarket={goToMarket}
                                    />
                                ),
                            )}
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
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
`;

const Table = styled.table`
    border-collapse: collapse;
    width: 100%;
    position: relative;
    table-layout: fixed;

    @media only screen and (min-width: 1280px) {
        td,
        th {
            min-width: 180px;
        }
    }
`;

const TableBody = styled.tbody`
    //   border-top: 1px solid var(--dark3);
    background-color: var(--dark1);
    color: var(--white);
    font-size: 12px;
    font-family: 'Roboto', sans-serif;
    text-transform: capitalize;
    line-height: 1.5rem;
    overflow-y: auto;
    max-height: 96px;
`;
