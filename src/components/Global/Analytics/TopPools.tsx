export default function TopPools() {
    const data = [
        {
            token: 'BTC/ETH',
            pool: '1,000',
            prize: '10,000',
            tvl: '100,000',
            volume: '1,000,000',
            change: '+5%',
        },
    ];
    const duplicatedData = Array.from({ length: 50 }, () => data).flat();

    return (
        <div className='flex flex-col h-screen'>
            <div className='flex-grow overflow-auto'>
                <div className='py-2'>
                    <div className='shadow rounded-lg bg-dark1'>
                        <table className=' divide-y divide-dark3 relative w-full'>
                            <thead
                                className='bg-dark1 sticky top-0  h-25'
                                style={{ height: '25px', zIndex: '2' }}
                            >
                                <tr className='text-text2 text-body font-regular capitalize leading-body'>
                                    <th
                                        scope='col'
                                        className='sticky top-0 px-12  text-left    tracking-wider'
                                    >
                                        Tokens
                                    </th>
                                    <th
                                        scope='col'
                                        className='hidden sm:table-cell sticky top-0 px-6  text-left    tracking-wider'
                                    >
                                        Pool
                                    </th>
                                    <th
                                        scope='col'
                                        className='hidden md:table-cell sticky top-0 px-6  text-left    tracking-wider'
                                    >
                                        Prize
                                    </th>
                                    <th
                                        scope='col'
                                        className='hidden lg:table-cell sticky top-0 px-6  text-left    tracking-wider'
                                    >
                                        TVL
                                    </th>
                                    <th
                                        scope='col'
                                        className='hidden xl:table-cell sticky top-0 px-6  text-left    tracking-wider'
                                    >
                                        Volume
                                    </th>
                                    <th
                                        scope='col'
                                        className='hidden xl:table-cell sticky top-0 px-6  text-left    tracking-wider'
                                    >
                                        Change
                                    </th>
                                    <th
                                        scope='col'
                                        className='sticky top-0 px-6  text-right    tracking-wider'
                                    >
                                        Menu
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='bg-dark1 text-white text-body font-regular capitalize leading-body overflow-y-auto max-h-96'>
                                {duplicatedData.map((row, index) => (
                                    <tr key={index}>
                                        <td className='px-6  whitespace-nowrap'>
                                            <div className='flex items-center'>
                                                <div className='flex-shrink-0 flex items-center'>
                                                    <img
                                                        className='h-30 w-30 rounded-full p-1'
                                                        src='https://via.placeholder.com/30'
                                                        alt='Token Logo'
                                                    />
                                                    <img
                                                        className='h-30 w-30 rounded-full p-1'
                                                        src='https://via.placeholder.com/30'
                                                        alt='Token Logo'
                                                    />
                                                </div>
                                                <div className='ml-4'>
                                                    <div className='text-sm font-medium text-gray-900'>
                                                        {row.token}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td
                                            className='hidden sm:table-cell px-6  whitespace-nowrap'
                                            style={{ height: '40px' }}
                                        >
                                            <div className=' text-text1'>
                                                {row.pool}
                                            </div>
                                        </td>
                                        <td
                                            className='hidden md:table-cell px-6  whitespace-nowrap'
                                            style={{ height: '40px' }}
                                        >
                                            <div className=' text-accent5'>
                                                {row.prize}
                                            </div>
                                        </td>
                                        <td
                                            className='hidden lg:table-cell px-6  whitespace-nowrap'
                                            style={{ height: '40px' }}
                                        >
                                            <div className=' text-text1'>
                                                {row.tvl}
                                            </div>
                                        </td>
                                        <td
                                            className='hidden xl:table-cell px-6  whitespace-nowrap'
                                            style={{ height: '40px' }}
                                        >
                                            <div className=' text-text1'>
                                                {row.volume}
                                            </div>
                                        </td>
                                        <td
                                            className='hidden xl:table-cell px-6  whitespace-nowrap'
                                            style={{ height: '40px' }}
                                        >
                                            <div className=' text-text1'>
                                                {row.change}
                                            </div>
                                        </td>
                                        <td
                                            className='px-6 whitespace-nowrap'
                                            style={{ height: '40px' }}
                                        >
                                            <div className='flex items-center justify-end h-full'>
                                                <button
                                                    className='flex items-center justify-center  text- bg-dark1 border-dark3 border rounded-full'
                                                    style={{
                                                        width: '48px',
                                                        height: '25px',
                                                    }}
                                                >
                                                    <span className='px-2 py-1'>
                                                        Trade
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
