import { useEffect, useState } from 'react';
import { getPoolPriceChange } from '../../../../App/functions/getPoolStats';
import { PoolIF } from '../../../../utils/interfaces/PoolIF';
import styles from './TopTokensCard.module.css';

interface TopTokensCardProps {
    chainId: string;
    pool: PoolIF;
}

export default function TopTokensCard(props: TopTokensCardProps) {
    const { pool } = props;

    const topTokenName = pool.name;

    const [tokenPrice, setTokenPrice] = useState<string | undefined>();
    const [tokenPrice24hChange, setTokenPrice24hChange] = useState<string | undefined>();

    useEffect(() => {
        (async () => {
            const poolPriceChange = await getPoolPriceChange(
                pool.chainId,
                pool.base.address,
                pool.quote.address,
                pool.poolId,
            );

            const isDenomBase = pool.name === pool.base.symbol;

            const priceBaseOverQuoteDecimalAdj =
                poolPriceChange.priceEnd?.priceBaseOverQuoteDecimalAdj;
            const priceQuoteOverBaseDecimalAdj =
                poolPriceChange.priceEnd?.priceQuoteOverBaseDecimalAdj;

            const tokenPrice = isDenomBase
                ? priceQuoteOverBaseDecimalAdj
                : priceBaseOverQuoteDecimalAdj;

            const tokenPriceString = tokenPrice
                ? '$' +
                  tokenPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  })
                : undefined;

            setTokenPrice(tokenPriceString);

            const changeBaseOverQuote = poolPriceChange.changeBaseOverQuote;
            const changeQuoteOverBase = poolPriceChange.changeQuoteOverBase;

            const tokenPriceChangePercentage = isDenomBase
                ? changeQuoteOverBase
                : changeBaseOverQuote;

            const tokenPriceChangeString = tokenPriceChangePercentage
                ? tokenPriceChangePercentage > 0
                    ? '+' +
                      tokenPriceChangePercentage.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      }) +
                      '%'
                    : tokenPriceChangePercentage.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      }) + '%'
                : undefined;

            setTokenPrice24hChange(tokenPriceChangeString);
        })();
    }, [JSON.stringify(pool)]);

    return (
        <div className={styles.container}>
            <div>{topTokenName}</div>
            <div>{tokenPrice ?? '…'}</div>
            <div>{tokenPrice24hChange ?? '…'}</div>
        </div>
    );
}
