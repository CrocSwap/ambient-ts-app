import styles from './TokenInfo.module.css';
import { querySpotPrice } from '../../../App/functions/querySpotPrice';
// import { memoizePromiseFn } from '../../../App/functions/memoizePromiseFn';
import { useEffect, useState } from 'react';
import { toDisplayPrice } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';

// const cachedQuerySpotPrice = memoizePromiseFn(querySpotPrice);

interface ITokenInfoProps {
    provider: ethers.providers.Provider | undefined;
    chainId: string;
    baseTokenAddress: string;
    baseTokenDecimals: number;
    quoteTokenAddress: string;
    quoteTokenDecimals: number;
    lastBlockNumber: number;
    isDenomBase: boolean;
}

export default function TokenInfo(props: ITokenInfoProps) {
    const {
        provider,
        chainId,
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
        if (provider && baseTokenAddress && quoteTokenAddress && lastBlockNumber) {
            (async () => {
                const spotPrice = await querySpotPrice(
                    provider,
                    baseTokenAddress,
                    quoteTokenAddress,
                    chainId,
                    lastBlockNumber,
                );
                const displayPrice = toDisplayPrice(
                    spotPrice,
                    baseTokenDecimals,
                    quoteTokenDecimals,
                );

                const displayPriceWithDenom = isDenomBase ? 1 / displayPrice : displayPrice;

                const displayPriceString =
                    displayPriceWithDenom === Infinity || displayPriceWithDenom === 0
                        ? '...'
                        : displayPriceWithDenom < 2
                        ? displayPriceWithDenom.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                          })
                        : displayPriceWithDenom.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          });

                setDisplayPrice(displayPriceString);
            })();
        }
    }, [provider, isDenomBase, lastBlockNumber, baseTokenAddress, quoteTokenAddress]);

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
