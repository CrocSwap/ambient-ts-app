import styles from './TokenInfo.module.css';
import { querySpotPrice } from '../../../App/functions/querySpotPrice';
// import { memoizePromiseFn } from '../../../App/functions/memoizePromiseFn';
import { useEffect, useState } from 'react';
import { CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';
import { get24hChange } from '../../../App/functions/getPoolStats';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

// const cachedQuerySpotPrice = memoizePromiseFn(querySpotPrice);

interface ITokenInfoProps {
    crocEnv: CrocEnv;
    chainId: string;
    baseTokenAddress: string;
    baseTokenDecimals: number;
    quoteTokenAddress: string;
    quoteTokenDecimals: number;
    lastBlockNumber: number;
    isDenomBase: boolean;
    positionApy: number | undefined;
}

export default function TokenInfo(props: ITokenInfoProps) {
    const {
        crocEnv,
        chainId,
        baseTokenAddress,
        baseTokenDecimals,
        quoteTokenAddress,
        quoteTokenDecimals,
        lastBlockNumber,
        isDenomBase,
        positionApy,
    } = props;

    const [displayPrice, setDisplayPrice] = useState('');
    const [poolPriceChangePercent, setPoolPriceChangePercent] = useState<string | undefined>(
        undefined,
    );
    const [isPoolPriceChangePositive, setIsPoolPriceChangePositive] = useState<boolean>(true);

    const positionApyString =
        positionApy !== undefined
            ? `APR | ${positionApy.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })}%`
            : '…';

    useEffect(() => {
        (async () => {
            if (baseTokenAddress && quoteTokenAddress) {
                try {
                    const poolIndex = lookupChain(chainId).poolIndex;

                    const priceChangeResult = await get24hChange(
                        chainId,
                        baseTokenAddress,
                        quoteTokenAddress,
                        poolIndex,
                        isDenomBase,
                    );
                    if (priceChangeResult > -0.01 && priceChangeResult < 0.01) {
                        setPoolPriceChangePercent('No Change');
                    } else if (priceChangeResult) {
                        priceChangeResult > 0
                            ? setIsPoolPriceChangePositive(true)
                            : setIsPoolPriceChangePositive(false);

                        const priceChangeString =
                            priceChangeResult > 0
                                ? '+' +
                                  priceChangeResult.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  }) +
                                  '%'
                                : priceChangeResult.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  }) + '%';
                        setPoolPriceChangePercent(priceChangeString);
                    } else {
                        setPoolPriceChangePercent(undefined);
                    }
                } catch (error) {
                    setPoolPriceChangePercent(undefined);
                }
            }
        })();
    }, [isDenomBase, baseTokenAddress, quoteTokenAddress, lastBlockNumber]);

    // useEffect to get spot price when tokens change and block updates
    useEffect(() => {
        if (crocEnv && baseTokenAddress && quoteTokenAddress && lastBlockNumber) {
            (async () => {
                const spotPrice = await querySpotPrice(
                    crocEnv,
                    baseTokenAddress,
                    quoteTokenAddress,
                    chainId,
                    lastBlockNumber,
                );
                if (spotPrice) {
                    const displayPrice = toDisplayPrice(
                        spotPrice,
                        baseTokenDecimals,
                        quoteTokenDecimals,
                    );

                    const displayPriceWithDenom = isDenomBase ? 1 / displayPrice : displayPrice;

                    const displayPriceString =
                        displayPriceWithDenom === Infinity || displayPriceWithDenom === 0
                            ? '…'
                            : displayPriceWithDenom < 2
                            ? displayPriceWithDenom.toPrecision(4)
                            : displayPriceWithDenom.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              });

                    setDisplayPrice(displayPriceString);
                }
            })();
        }
    }, [crocEnv, isDenomBase, lastBlockNumber, baseTokenAddress, quoteTokenAddress]);

    const aprColor =
        positionApy !== undefined
            ? positionApy > 0
                ? styles.apr_green
                : styles.apr_red
            : styles.apr_green;

    return (
        <div className={styles.token_info_container}>
            <div className={styles.price_info}>
                <span className={styles.price}>${displayPrice}</span>
                <span
                    className={
                        isPoolPriceChangePositive
                            ? styles.price_change_positive
                            : styles.price_change_negative
                    }
                >
                    {poolPriceChangePercent === undefined ? '…' : poolPriceChangePercent + ' | 24h'}
                </span>
            </div>
            <div className={aprColor}>{positionApyString}</div>
        </div>
    );
}
