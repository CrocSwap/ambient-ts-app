import { Link } from 'react-router-dom';
import styles from './SearchableTicker.module.css';
import {
    getFormattedNumber,
    getTimeRemainingAbbrev,
} from '../../../ambient-utils/dataLayer';
import moment from 'moment';
import { Dispatch, SetStateAction, useContext, useEffect } from 'react';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { AuctionDataIF } from '../../../contexts/AuctionsContext';

interface PropsIF {
    auction: AuctionDataIF;
    setSelectedTicker: Dispatch<
        SetStateAction<AuctionDataIF | null | undefined>
    >;
    selectedTicker: AuctionDataIF | null | undefined;
}
export default function TickerItem(props: PropsIF) {
    const { auction, selectedTicker, setSelectedTicker } = props;

    const { ticker, marketCap, createdAt, status, auctionLength } = auction;

    const { nativeTokenUsdPrice } = useContext(ChainDataContext);

    const timeRemaining = getTimeRemainingAbbrev(
        moment(createdAt * 1000).diff(
            Date.now() - auctionLength * 1000,
            'seconds',
        ),
    );

    const status2 =
        timeRemaining === 'COMPLETE' ? 'var(--accent1)' : 'var(--accent4)';

    const marketCapUsdValue =
        nativeTokenUsdPrice !== undefined && marketCap !== undefined
            ? nativeTokenUsdPrice * marketCap
            : undefined;

    const formattedMarketCap =
        marketCapUsdValue !== undefined
            ? marketCapUsdValue
                ? getFormattedNumber({
                      value: marketCapUsdValue,
                      minFracDigits: 0,
                      maxFracDigits: 0,
                      isUSD: true,
                  })
                : '$0'
            : undefined;

    useEffect(() => {
        if (ticker) {
            setSelectedTicker(auction);
        }
    }, [ticker]);

    return (
        <Link
            className={`${styles.tickerItemContainer} ${
                auction?.ticker === selectedTicker?.ticker ? styles.active : ''
            }`}
            to={'/auctions/v1/' + ticker}
            onClick={() => setSelectedTicker(auction)}
        >
            <p>{ticker}</p>
            <p className={styles.marketCap}>{formattedMarketCap}</p>
            <p style={{ color: status ? status : 'var(--text1)' }}>
                {timeRemaining}
            </p>
            <div className={styles.statusContainer}>
                {status2 && (
                    <span
                        className={styles.tickerStatus}
                        style={{ background: status2 ? status2 : '' }}
                    />
                )}
            </div>
        </Link>
    );
}
