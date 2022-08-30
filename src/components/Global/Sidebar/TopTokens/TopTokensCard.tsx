import { useEffect, useState } from 'react';
import { getPoolPriceChange } from '../../../../App/functions/getPoolStats';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { PoolIF } from '../../../../utils/interfaces/PoolIF';
import { setTokenA, setTokenB } from '../../../../utils/state/tradeDataSlice';
import styles from './TopTokensCard.module.css';

interface TopTokensCardProps {
    chainId: string;
    pool: PoolIF;
    lastBlockNumber: number;
}

export default function TopTokensCard(props: TopTokensCardProps) {
    const { pool, lastBlockNumber } = props;

    const dispatch = useAppDispatch();

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
    }, [JSON.stringify(pool), lastBlockNumber]);

    return (
        <div
            className={styles.container}
            onClick={() => {
                dispatch(setTokenA(props.pool.base));
                dispatch(setTokenB(props.pool.quote));
            }}
        >
            <div>{topTokenName}</div>
            <div>{tokenPrice ?? '…'}</div>
            <div>{tokenPrice24hChange ?? '…'}</div>
        </div>
    );
}
