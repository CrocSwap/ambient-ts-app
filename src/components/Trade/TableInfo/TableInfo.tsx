interface FeaturedBoxPropsIF {
    tokenLogo: string;
    tokenSymbol: string;
    tokenName: string;
    tokenAddress: string;
    balance: string;
    value: string;
}
interface DetailedBoxPropsIF {
    label: string;
    value: string;
}
export default function TableInfo() {
    const detailedData = [
        { label: 'Market Cap:', value: '$69m' },
        { label: 'FDV:', value: '$690m' },
        { label: '24h Swap Volume:', value: '$6.93k' },
        { label: 'Total Fees:', value: '$6.93k' },
        { label: 'TVL:', value: '$2.27m' },
        { label: 'Tixk Liquidity:', value: '$500k' },
        { label: 'Out of Range Liq:', value: '20%' },
        { label: 'Pool Created:', value: '15/07/2022' },
    ];
    const featuredData = [
        {
            tokenLogo: 'https://via.placeholder.com/30',
            tokenSymbol: 'ETH',
            tokenName: 'Ethereum',
            tokenAddress: 'ffhei23ifvhdfd',
            balance: '169.00',
            value: '420,000',
        },
        {
            tokenLogo: 'https://via.placeholder.com/30',
            tokenSymbol: 'USDC',
            tokenName: 'Usd coin',
            tokenAddress: 'ffhei23ifvhdfd',
            balance: '420,000.00',
            value: '420,000',
        },
    ];
    function FeaturedBox(props: FeaturedBoxPropsIF) {
        const {
            tokenLogo,
            tokenSymbol,
            tokenName,
            tokenAddress,
            balance,
            value,
        } = props;
        return (
            <div className='col-span-1 bg-dark3 rounded'>
                {' '}
                <div className='flex flex-col gap-4 p-4'>
                    {' '}
                    <div className='flex items-center'>
                        {' '}
                        <img
                            src={tokenLogo}
                            alt='Logo'
                            className='w-6 h-6'
                        />{' '}
                        <span className='ml-2 text-header2 font-extralight'>
                            {' '}
                            {tokenSymbol}{' '}
                        </span>{' '}
                        <span className='ml-2 text-body text-text2'>
                            {' '}
                            {tokenName}{' '}
                        </span>{' '}
                    </div>{' '}
                    <div className='flex items-center'>
                        {' '}
                        <span className='text-text2 text-body'>
                            {' '}
                            {tokenAddress}{' '}
                        </span>{' '}
                        <span className='ml-2 text-xs text-blue-500'>Link</span>{' '}
                    </div>{' '}
                    <div className='mt-2 flex flex-col gap-2'>
                        {' '}
                        <span className='text-text2 text-body'>
                            Balance
                        </span>{' '}
                        <span className='text-header2 font-extralight text-text1'>
                            {' '}
                            {balance}{' '}
                        </span>{' '}
                    </div>{' '}
                    <div className='mt-2 flex flex-col gap-2'>
                        {' '}
                        <span className='text-text2 text-body'>Value</span>{' '}
                        <span className='text-header2 font-extralight text-text1'>
                            {' '}
                            ${value}{' '}
                        </span>{' '}
                    </div>{' '}
                </div>{' '}
            </div>
        );
    }
    function DetailedBox(props: DetailedBoxPropsIF) {
        const { label, value } = props;
        return (
            <div className='col-span-1 bg-dark3 rounded'>
                {' '}
                <div className='mt-2 flex flex-col gap-2 p-4'>
                    {' '}
                    <span className='text-text2 text-body'>{label}</span>{' '}
                    <span className='text-header2 font-extralight text-text1'>
                        {' '}
                        {value}{' '}
                    </span>{' '}
                </div>{' '}
            </div>
        );
    }
    return (
        <section style={{ height: '100%' }}>
            {' '}
            <div className='grid grid-cols-2 gap-2 h-full'>
                {' '}
                <div className='grid grid-cols-2 gap-2'>
                    {' '}
                    {featuredData.map((data, idx) => (
                        <FeaturedBox
                            key={idx}
                            tokenLogo={data.tokenLogo}
                            tokenSymbol={data.tokenSymbol}
                            tokenName={data.tokenName}
                            tokenAddress={data.tokenAddress}
                            balance={data.balance}
                            value={data.value}
                        />
                    ))}{' '}
                </div>
                <section className='grid grid-row-3 gap-2'>
                    {' '}
                    <div className='grid grid-cols-4 gap-2'>
                        {' '}
                        {detailedData.slice(0, 4).map((data, idx) => (
                            <DetailedBox
                                label={data.label}
                                value={data.value}
                                key={idx}
                            />
                        ))}{' '}
                    </div>
                    <div className='grid grid-cols-4 gap-2'>
                        {' '}
                        {detailedData
                            .slice(4, detailedData.length)
                            .map((data, idx) => (
                                <DetailedBox
                                    label={data.label}
                                    value={data.value}
                                    key={idx}
                                />
                            ))}{' '}
                    </div>{' '}
                    <div>
                        {' '}
                        <div className='col-span-1 bg-dark3 h-full'>
                            {' '}
                            This is where the tabs go{' '}
                        </div>{' '}
                    </div>{' '}
                </section>{' '}
            </div>{' '}
        </section>
    );
}
