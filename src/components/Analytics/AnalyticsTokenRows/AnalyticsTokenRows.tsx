import React, { useState } from 'react';
import styles from './AnalyticsTokenRows.module.css';
import { uniswapTokens } from '../fakedata/uniswapTokens';
import { useLocation } from 'react-router-dom';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';

interface AnalyticsTokenRowsPropsIF {
    searchInput?: string;
}
interface TokenPropsIF {
    img: string;
    symbol: string;
}
function Token(props: TokenPropsIF) {
    const { img, symbol } = props;
    const [active, setActive] = useState(false);

    return (
        <div
            className={`${styles.token_container} ${active && styles.token_container_active}`}
            onClick={() => setActive(!active)}
        >
            <IconWithTooltip title={symbol} placement='bottom'>
                <img src={img} alt='token' />
            </IconWithTooltip>
        </div>
    );
}
export default function AnalyticsTokenRows(props: AnalyticsTokenRowsPropsIF) {
    const { searchInput } = props;
    const location = useLocation();
    const currentLocation = location.pathname;
    const tokenData = uniswapTokens[0].tokens;

    console.log(tokenData);
    const itemsToMap = searchInput == '' ? 10 : 2;

    if (currentLocation.includes('overview')) return null;
    return (
        <>
            <p style={{ color: 'pink' }}>
                concept: clicking on the following tokens will filter pools with that token
            </p>
            <div className={styles.token_rows_container}>
                {tokenData.slice(0, itemsToMap).map((token, i) => (
                    <Token key={i} img={token.logoURI} symbol={token.symbol} />
                ))}
            </div>
        </>
    );
}

// Inspiration: https://www.sushi.com/analytics
