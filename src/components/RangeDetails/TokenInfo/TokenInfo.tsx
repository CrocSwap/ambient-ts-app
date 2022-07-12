import styles from './TokenInfo.module.css';
import { querySpotPrice } from '../../../App/functions/querySpotPrice';
import { memoizePromiseFn } from '../../../App/functions/memoizePromiseFn';
import { useEffect, useState } from 'react';
import { toDisplayPrice } from '@crocswap-libs/sdk';

const cachedQuerySpotPrice = memoizePromiseFn(querySpotPrice);

interface ITokenInfoProps {
    baseTokenAddress: string;
    baseTokenDecimals: number;
    quoteTokenAddress: string;
    quoteTokenDecimals: number;
    lastBlockNumber: number;
    isDenomBase: boolean;
}

export default function TokenInfo(props: ITokenInfoProps) {
    const {
        baseTokenAddress,
        baseTokenDecimals,
        quoteTokenAddress,
        quoteTokenDecimals,
        lastBlockNumber,
        isDenomBase,
    } = props;

    const [displayPrice, setDisplayPrice] = useState('');

    // useEffect to get spot price when tokens change and block updates
    useEffect(() => {
        if (baseTokenAddress && quoteTokenAddress) {
            (async () => {
                const spotPrice = await cachedQuerySpotPrice(
                    baseTokenAddress,
                    quoteTokenAddress,
                    lastBlockNumber,
                );
                const displayPriceInQuote = toDisplayPrice(
                    spotPrice,
                    baseTokenDecimals,
                    quoteTokenDecimals,
                );

                const displayPriceInBase = 1 / displayPriceInQuote;

                const displayPrice = isDenomBase
                    ? displayPriceInBase.toPrecision(6)
                    : displayPriceInQuote.toPrecision(6);

                setDisplayPrice(displayPrice);
            })();
        }
    }, [lastBlockNumber, baseTokenAddress, quoteTokenAddress]);

    return (
        <div className={styles.token_info_container}>
            <div className={styles.price_info}>
                <span className={styles.price}>${displayPrice}</span>
                <span className={styles.price_change}>+8.57% | 24h</span>
            </div>
            <div className={styles.apy}>APY | 35.65%</div>
        </div>
    );
}
