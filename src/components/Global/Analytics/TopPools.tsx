import { useContext, useEffect } from 'react';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import useFetchPoolStats from '../../../App/hooks/useFetchPoolStats';
import { topPoolIF } from '../../../App/hooks/useTopPools';
import TokenIcon from '../TokenIcon/TokenIcon';
import uriToHttp from '../../../utils/functions/uriToHttp';
import { useNavigate } from 'react-router-dom';
type PoolStats = {
    poolName?: string;
    baseLogoUri?: string;
    quoteLogoUri?: string;
    poolVolume?: string;
    poolPrice?: string;
    poolTvl?: string;
    poolApy?: string;
    poolPriceChangePercent?: string;
    isPoolPriceChangePositive?: boolean;

    baseTokenCharacter?: string;
    quoteTokenCharacter?: string;
};

type HeaderItem = {
    label: string;
    hidden: boolean;
    align: string;
    responsive?: string;
    clickable: boolean;
    pxValue?: number;
};
export default function TopPools() {
    const { topPools } = useContext(CrocEnvContext);

    const formattedPoolData: PoolStats[] = [];
    useEffect(() => {
        const fetchPoolData = async () => {
            for (const pool of topPools) {
                const poolStats = await useFetchPoolStats(pool);
                formattedPoolData.push(poolStats);
            }
        };

        fetchPoolData();
    }, []);

    const PoolRow = (pool: topPoolIF) => {
        const poolData = useFetchPoolStats(pool);
        const {
            poolName,
            baseLogoUri,
            quoteLogoUri,
            poolVolume,
            poolPrice,
            poolTvl,
            poolApy,
            poolPriceChangePercent,
            isPoolPriceChangePositive,
            poolLink,
        } = poolData;

        const navigate = useNavigate();

        const navigateToTrade = () => {
            navigate(poolLink);
        };

        return (
            <tr
                className='hover:bg-dark2 cursor-pointer'
                onClick={navigateToTrade}
            >
                <td className='px-6  whitespace-nowrap'>
                    <div className='flex items-center'>
                        <div className='flex-shrink-0 flex items-center'>
                            <TokenIcon
                                src={uriToHttp(baseLogoUri ?? '...')}
                                alt={poolName}
                                size='2xl'
                            />
                            <TokenIcon
                                src={uriToHttp(quoteLogoUri ?? '...')}
                                alt={poolName}
                                size='2xl'
                            />
                        </div>
                        <div className='ml-4  sm:hidden md:hidden lg:hidden xl:hidden'>
                            <div className='text-text1'>
                                {poolName ?? '...'}
                            </div>
                        </div>
                    </div>
                </td>
                <td
                    className='hidden sm:table-cell px-6  whitespace-nowrap'
                    style={{ height: '40px' }}
                >
                    <div className=' text-text1'>{poolName ?? '...'}</div>
                </td>
                <td
                    className='hidden sm:table-cell px-6  whitespace-nowrap'
                    style={{ height: '40px' }}
                >
                    <div className=' text-accent5'>{poolPrice ?? '...'}</div>
                </td>
                <td
                    className='hidden sm:table-cell px-6  whitespace-nowrap'
                    style={{ height: '40px' }}
                >
                    <div className=' text-text1'>{poolTvl ?? '...'}</div>
                </td>
                <td
                    className='hidden xl:table-cell px-6  whitespace-nowrap'
                    style={{ height: '40px' }}
                >
                    <div
                        className={`text-text1 ${
                            Number(poolApy) > 0
                                ? 'text-positive'
                                : 'text-negative'
                        }`}
                    >
                        {poolApy ? poolApy + '%' : '...'}
                    </div>
                </td>
                <td
                    className=' px-6  whitespace-nowrap'
                    style={{ height: '40px' }}
                >
                    <div className=' text-text1'>{poolVolume ?? '...'}</div>
                </td>
                <td
                    className='hidden lg:table-cell px-6  whitespace-nowrap'
                    style={{ height: '40px' }}
                >
                    <div
                        className={`text-text1 ${
                            isPoolPriceChangePositive
                                ? 'text-positive'
                                : 'text-negative'
                        }`}
                    >
                        {poolPriceChangePercent ?? '...'}
                    </div>
                </td>
                <td
                    className='px-6 whitespace-nowrap'
                    style={{ height: '40px' }}
                >
                    <div className='flex items-center justify-end h-full'>
                        <button
                            className='flex items-center justify-center text-bg-dark1 border-dark3 border rounded-full hover:text-accent1 hover:border-accent1'
                            style={{
                                width: '48px',
                                height: '25px',
                            }}
                        >
                            <span className='px-2 py-1'>Trade</span>
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

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
                        <table className='divide-y divide-dark3 relative w-full '>
                            <TableHead headerItems={topPoolsHeaderItems} />

                            <tbody className='bg-dark1 text-white text-body font-regular capitalize leading-body overflow-y-auto max-h-96'>
                                {topPools.map((pool, index) => (
                                    <PoolRow key={index} {...pool} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
