import { useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getPoolPriceChange } from '../../../../App/functions/getPoolStats';
import { PoolIF } from '../../../../utils/interfaces/exports';
import styles from './TopTokensCard.module.css';

interface propsIF {
    chainId: string;
    pool: PoolIF;
    // lastBlockNumber: number;
}

export default function TopTokensCard(props: propsIF) {
    const { pool } = props;

    const location = useLocation();
    // allow a local environment variable to be defined in [app_repo]/.env.local to turn off connections to the cache server
    const isServerEnabled =
        process.env.REACT_APP_CACHE_SERVER_IS_ENABLED !== undefined
            ? process.env.REACT_APP_CACHE_SERVER_IS_ENABLED === 'true'
            : true;

    const linkPath = useMemo(() => {
        const { pathname } = location;
        let locationSlug = '';
        if (pathname.startsWith('/trade/market') || pathname.startsWith('/account')) {
            locationSlug = '/trade/market';
        } else if (pathname.startsWith('/trade/limit')) {
            locationSlug = '/trade/limit';
        } else if (pathname.startsWith('/trade/range')) {
            locationSlug = '/trade/range';
        } else if (pathname.startsWith('/swap')) {
            locationSlug = '/swap';
        }
        return (
            locationSlug +
            '/chain=0x5&tokenA=' +
            pool.base.address +
            '&tokenB=' +
            pool.quote.address
        );
    }, [location]);

    const topTokenName = pool.name;

    const [tokenPrice, setTokenPrice] = useState<string | undefined>();
    const [tokenPrice24hChange, setTokenPrice24hChange] = useState<string | undefined>();

    const fetchPoolPriceChange = () => {
        (async () => {
            console.log('fetching pool price change');
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
    };

    useEffect(() => {
        if (isServerEnabled) {
            fetchPoolPriceChange();

            // fetch every minute
            const timerId = setInterval(() => {
                fetchPoolPriceChange();
            }, 60000);

            // after 1 hour stop
            setTimeout(() => {
                clearInterval(timerId);
            }, 3600000);

            // clear interval when component unmounts
            return () => clearInterval(timerId);
        }
    }, []);

    return (
        <Link className={styles.container} to={linkPath}>
            <div>{topTokenName}</div>
            <div>{tokenPrice ?? '…'}</div>
            <div>{tokenPrice24hChange ?? '…'}</div>
        </Link>
    );
}
