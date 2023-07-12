import TokenIcon from '../TokenIcon/TokenIcon';
import uriToHttp from '../../../utils/functions/uriToHttp';
import { PoolDataIF } from '../../../contexts/AnalyticsContext';

interface propsIF {
    pool: PoolDataIF;
    goToMarket: (tknA: string, tknB: string) => void;
}

export default function PoolRow(props: propsIF) {
    const { pool, goToMarket } = props;

    return (
        <tr
            className='hover:bg-dark2 cursor-pointer analaytics-pools-table '
            onClick={() => goToMarket(pool.base.address, pool.quote.address)}
        >
            <td className='px-6  whitespace-nowrap'>
                <div className='flex items-center'>
                    <div className='flex-shrink-0 flex items-center'>
                        <TokenIcon
                            src={uriToHttp(pool.base.logoURI)}
                            alt={'logo for token: ' + pool.base.name}
                            size='2xl'
                        />
                        <TokenIcon
                            src={uriToHttp(pool.quote.logoURI)}
                            alt={'logo for token: ' + pool.quote.name}
                            size='2xl'
                        />
                    </div>
                    <div className='ml-4  sm:hidden '>
                        <div className='text-text1'>{pool.name}</div>
                    </div>
                </div>
            </td>
            <td
                className='hidden sm:table-cell px-6  whitespace-nowrap'
                style={{ height: '40px' }}
            >
                <div className=' text-text1'>{pool.name}</div>
            </td>
            <td
                className='hidden sm:table-cell px-6  whitespace-nowrap'
                style={{ height: '40px' }}
            >
                <div className=' text-accent5'>{pool.displayPrice}</div>
            </td>
            <td
                className='hidden sm:table-cell px-6  whitespace-nowrap'
                style={{ height: '40px' }}
            >
                <div className=' text-text1'>
                    {!pool.tvlStr || pool.tvlStr.includes('NaN')
                        ? ''
                        : pool.tvlStr}
                </div>
            </td>
            <td
                className='hidden xl:table-cell px-6  whitespace-nowrap'
                style={{ height: '40px' }}
            >
                <div
                    className={`text-text1 ${
                        Number(pool.apyStr) > 0
                            ? 'text-positive'
                            : 'text-negative'
                    }`}
                >
                    {pool.apyStr}
                </div>
            </td>
            <td className=' px-6  whitespace-nowrap' style={{ height: '40px' }}>
                <div className=' text-text1'>{pool.volumeStr}</div>
            </td>
            <td
                className='hidden lg:table-cell px-6  whitespace-nowrap'
                style={{ height: '40px' }}
            >
                <div
                    className={`text-text1 ${
                        pool.priceChange.startsWith('-')
                            ? 'text-negative'
                            : 'text-positive'
                    }`}
                >
                    {pool.priceChange}
                </div>
            </td>
            <td className='px-6 whitespace-nowrap' style={{ height: '40px' }}>
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
}
