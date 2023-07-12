import { memo } from 'react';
import PoolRow from './PoolRow';
import { PoolDataIF } from '../../../contexts/AnalyticsContext';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';
import {
    SortedPoolMethodsIF,
    sortType,
    useSortedPools,
} from './useSortedPools';
import checkPoolForWETH from '../../../App/functions/checkPoolForWETH';
import { PoolIF } from '../../../utils/interfaces/exports';

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
                className='sticky top-0 h-25'
                style={{ height: '25px', zIndex: '2' }}
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
        <div className='flex flex-col h-full'>
            <div className='flex-grow overflow-auto h-full hide-scrollbar'>
                <div className='py-2 h-full'>
                    <div className='shadow rounded-lg bg-dark1 h-full py-2'>
                        <table className='divide-y divide-dark3 relative w-full top-pools-analytics-table'>
                            <TableHead headerItems={topPoolsHeaderItems} />

                            <tbody className='bg-dark1 text-white text-body font-regular capitalize leading-body overflow-y-auto max-h-96'>
                                {
                                    // using index in key gen logic because there are duplicate
                                    // ... pool entries, we need to either filter out the dupes
                                    // ... (hacky but acceptable) or figure out why dupes are
                                    // ... being returned by PoolContext (preferable)
                                    sortedPools.pools
                                        .filter(
                                            (pool: PoolIF) =>
                                                !checkPoolForWETH(
                                                    pool,
                                                    chainId,
                                                ),
                                        )
                                        .slice(0, 20)
                                        .map(
                                            (pool: PoolDataIF, idx: number) => (
                                                <PoolRow
                                                    key={
                                                        JSON.stringify(pool) +
                                                        idx
                                                    }
                                                    pool={pool}
                                                    goToMarket={goToMarket}
                                                />
                                            ),
                                        )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default memo(TopPools);
