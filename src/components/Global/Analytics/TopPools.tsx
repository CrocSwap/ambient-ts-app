import { memo } from 'react';
import PoolRow from './PoolRow';
import { PoolDataIF } from '../../../contexts/AnalyticsContext';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';

type HeaderItem = {
    label: string;
    hidden: boolean;
    align: string;
    responsive?: string;
    clickable: boolean;
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

    const TableHead = ({ headerItems }: { headerItems: HeaderItem[] }) => {
        return (
            <thead
                className='sticky top-0 h-25'
                style={{ height: '25px', zIndex: '2' }}
            >
                <tr className='text-text2 text-body font-regular capitalize leading-body'>
                    {headerItems.map((headerItem, index) => (
                        <th
                            key={index}
                            scope='col'
                            className={`${headerItem.hidden ? 'hidden' : ''} ${
                                headerItem.responsive
                                    ? `${headerItem.responsive}:table-cell`
                                    : ''
                            } sticky top-0 ${
                                headerItem.pxValue
                                    ? `px-${headerItem.pxValue}`
                                    : 'px-6'
                            } text-${headerItem.align} tracking-wider ${
                                headerItem.clickable
                                    ? 'hover:bg-dark2 cursor-pointer'
                                    : ''
                            }`}
                        >
                            {headerItem.label}
                        </th>
                    ))}
                </tr>
            </thead>
        );
    };

    const topPoolsHeaderItems: HeaderItem[] = [
        {
            label: 'Tokens',
            hidden: false,
            align: 'left',
            clickable: false,
            pxValue: 8,
        },
        {
            label: 'Pool',
            hidden: true,
            align: 'left',
            responsive: 'sm',
            clickable: false,
        },
        {
            label: 'Price',
            hidden: true,
            align: 'left',
            responsive: 'sm',
            clickable: true,
        },
        {
            label: 'TVL',
            hidden: true,
            align: 'left',
            responsive: 'sm',
            clickable: true,
        },
        {
            label: 'APR',
            hidden: true,
            align: 'left',
            responsive: 'xl',
            clickable: true,
        },
        { label: 'Volume', hidden: false, align: 'left', clickable: true },
        {
            label: 'Change',
            hidden: true,
            align: 'left',
            responsive: 'lg',
            clickable: false,
        },
        { label: '', hidden: false, align: 'right', clickable: false },
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
                                    allPools.map(
                                        (pool: PoolDataIF, idx: number) => (
                                            <PoolRow
                                                key={JSON.stringify(pool) + idx}
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
