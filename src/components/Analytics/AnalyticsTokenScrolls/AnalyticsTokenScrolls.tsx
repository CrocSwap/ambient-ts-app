import styles from './AnalyticsTokenScrolls.module.css';
import { uniswapTokens } from '../fakedata/uniswapTokens';
import { useLocation } from 'react-router-dom';

interface TokenItemPropsIF {
    // eslint-disable-next-line
    data: any;
    reverse: boolean;
}

const tokenData = uniswapTokens[0].tokens;
function TokenItem(props: TokenItemPropsIF) {
    const { data, reverse } = props;

    return (
        <section className={reverse ? styles.scroll_item_reverse : styles.scroll_item}>
            {
                // eslint-disable-next-line
                data.map((token: any, idx: number) => (
                    <div className={styles.scroll_item_content} key={idx}>
                        <img src={token.logoURI} alt={token.symbol} />
                        <p>{token.symbol}</p>
                    </div>
                ))
            }
        </section>
    );
}

export default function AnalyticsTokenScrolls() {
    const location = useLocation();
    const currentLocation = location.pathname;

    const firstBanner = (
        <div className={styles.inner}>
            <div className={styles.wrapper}>
                <TokenItem data={tokenData.slice(0, 100)} reverse={false} />
            </div>
        </div>
    );
    const secondBanner = (
        <div className={styles.inner}>
            <div className={styles.wrapper}>
                <TokenItem data={tokenData.slice(100, 150)} reverse={true} />
            </div>
        </div>
    );
    const thirdBanner = (
        <div className={styles.inner}>
            <div className={styles.wrapper}>
                <TokenItem data={tokenData.slice(150, 230)} reverse={false} />
            </div>
        </div>
    );
    if (currentLocation.includes('overview')) return null;

    return (
        <div className={styles.main_container}>
            {firstBanner}
            {secondBanner}
            {thirdBanner}
        </div>
    );
}

// Inspired: https://home.bancor.network/
