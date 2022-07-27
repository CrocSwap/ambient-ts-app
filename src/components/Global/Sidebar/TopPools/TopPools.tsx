import styles from './TopPools.module.css';
import TopPoolsCard from './TopPoolsCard';

export default function TopPools() {
    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Volume</div>
            <div>TVL</div>
        </div>
    );

    const mapItems = [
        {
            name: 'ETH / DAI',
            tokenA: {
                name: 'Native Ether',
                address: '0x0000000000000000000000000000000000000000',
                symbol: 'ETH',
                decimals: 18,
                chainId: 42,
                logoURI:
                    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
            },
            tokenB: {
                name: 'Dai Stablecoin',
                address: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
                symbol: 'DAI',
                decimals: 18,
                chainId: 42,
                logoURI: 'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png',
            },
        },
        {
            name: 'DAI / USDC',
            tokenA: {
                name: 'Dai Stablecoin',
                address: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
                symbol: 'DAI',
                decimals: 18,
                chainId: 42,
                logoURI: 'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png',
            },
            tokenB: {
                name: 'USDCoin',
                address: '0xb7a4f3e9097c08da09517b5ab877f7a917224ede',
                symbol: 'USDC',
                decimals: 6,
                chainId: 42,
                logoURI:
                    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
            },
        },
    ];
    return (
        <div className={styles.container}>
            {header}
            <div className={styles.content}>
                {mapItems.map((item, idx) => (
                    <TopPoolsCard pool={item} key={idx} />
                ))}
            </div>
        </div>
    );
}
