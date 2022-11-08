import React, { useState } from 'react';
import styles from './AnalyticsPoolRows.module.css';
import { uniswapTokens } from '../fakedata/uniswapTokens';
import { useLocation } from 'react-router-dom';
interface TokenPropsIF {
    img: string;
}
function Token(props: TokenPropsIF) {
    const { img } = props;
    const [active, setActive] = useState(false);

    return (
        <div
            className={`${styles.token_container} 
        ${active && styles.token_container_active}`}
            onClick={() => setActive(!active)}
        >
            <div>
                <img src={img} alt='token' />
                <img src='https://cryptologos.cc/logos/usd-coin-usdc-logo.png' alt='token' />
            </div>
            <section className={styles.align_center}>
                <div className={styles.row}>
                    <p>USDC</p>
                    <p>ETH</p>
                </div>
                <div className={styles.row}>
                    <p>24h Vol.</p>
                    <p>$101.4k</p>
                </div>
                <div className={styles.row}>
                    <p>24h APY</p>
                    <p>8.82%</p>
                </div>
                <div className={styles.row}>
                    <p>TVL</p>
                    <p>$209.71k</p>
                </div>
                <div className={styles.row}>
                    <p>Price</p>
                    <p>$1,350.60</p>
                </div>
            </section>
        </div>
    );
}
export default function AnalyticsPoolRows() {
    const location = useLocation();
    const currentLocation = location.pathname;
    const tokenData = uniswapTokens[0].tokens;
    console.log(tokenData);

    if (currentLocation.includes('overview')) return null;
    return (
        <div className={styles.token_rows_container}>
            {tokenData.slice(0, 10).map((token, i) => (
                <Token key={i} img={token.logoURI} />
            ))}
        </div>
    );
}

// Inspiration: https://www.sushi.com/analytics
