import { TokenIF } from '../../../utils/interfaces/TokenIF';
import styles from './PoolCard.module.css';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { querySpotPrice } from '../../../App/functions/querySpotPrice';
import getUnicodeCharacter from '../../../utils/functions/getUnicodeCharacter';

interface PoolCardProps {
    onClick: () => void;
    name: string;
    tokenMap: Map<string, TokenIF>;
    tokenA: TokenIF;
    tokenB: TokenIF;
    lastBlockNumber: number;
    provider: ethers.providers.Provider | undefined;
    chainId: string;
}

export default function PoolCard(props: PoolCardProps) {
    const { onClick, tokenMap, tokenA, tokenB, lastBlockNumber, provider, chainId } = props;

    const tokenAKey = tokenA?.address.toLowerCase() + '_0x' + tokenA?.chainId.toString();
    const tokenBKey = tokenB?.address.toLowerCase() + '_0x' + tokenB?.chainId.toString();

    const tokenAFromMap = tokenMap && tokenA?.address ? tokenMap.get(tokenAKey) : null;

    const tokenBFromMap = tokenMap && tokenB?.address ? tokenMap.get(tokenBKey) : null;

    const [poolPriceDisplay, setPoolPriceDisplay] = useState<string | undefined>();
    const [shouldInvertDisplay, setShouldInvertDisplay] = useState(true);

    const tokenACharacter = tokenA && poolPriceDisplay ? getUnicodeCharacter(tokenA?.symbol) : '';
    const tokenBCharacter = tokenB && poolPriceDisplay ? getUnicodeCharacter(tokenB?.symbol) : '';
    // useEffect to get spot price when tokens change and block updates
    useEffect(() => {
        if (
            tokenA?.address &&
            tokenB?.address &&
            tokenA?.decimals &&
            tokenB?.decimals &&
            lastBlockNumber !== 0
        ) {
            (async () => {
                const viewProvider = provider
                    ? provider
                    : (await new CrocEnv(chainId).context).provider;

                const spotPrice = await querySpotPrice(
                    viewProvider,
                    tokenA.address,
                    tokenB.address,
                    chainId,
                    lastBlockNumber,
                );

                // const spotPrice = await cachedQuerySpotPrice(
                //     viewProvider,
                //     baseTokenAddress,
                //     quoteTokenAddress,
                //     chainId,
                //     lastBlockNumber,
                // );
                // console.log({ spotPrice });

                // setPoolPriceNonDisplay(spotPrice);
                if (spotPrice) {
                    const displayPrice = toDisplayPrice(
                        spotPrice,
                        tokenA.decimals,
                        tokenB.decimals,
                    );

                    const shouldInvertDisplay = displayPrice < 1;

                    setShouldInvertDisplay(shouldInvertDisplay);

                    const displayPriceWithInversion = shouldInvertDisplay
                        ? 1 / displayPrice
                        : displayPrice;

                    const displayPriceWithFormatting =
                        displayPriceWithInversion < 2
                            ? displayPriceWithInversion.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 6,
                              })
                            : displayPriceWithInversion.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              });
                    setPoolPriceDisplay(displayPriceWithFormatting);
                } else {
                    setPoolPriceDisplay(undefined);
                }
            })();
        }
    }, [lastBlockNumber, tokenA, tokenB, chainId, provider]);

    return (
        <div className={styles.pool_card} onClick={onClick}>
            <div className={styles.row}>
                <div>
                    <img
                        src={shouldInvertDisplay ? tokenAFromMap?.logoURI : tokenBFromMap?.logoURI}
                        // src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                        alt=''
                    />
                    <img
                        src={shouldInvertDisplay ? tokenBFromMap?.logoURI : tokenAFromMap?.logoURI}
                        // src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png'
                        alt=''
                    />
                </div>
                <div className={styles.tokens_name}>
                    {shouldInvertDisplay
                        ? `${tokenA.symbol} / ${tokenB.symbol}`
                        : `${tokenB.symbol} / ${tokenA.symbol}`}
                </div>
            </div>

            <div className={styles.row}>
                <div></div>
                <div>
                    <div className={styles.row_title}>APY</div>
                    <div className={styles.apy}>35.68%</div>
                </div>
            </div>
            <div className={styles.row}>
                <div></div>
                <div>
                    <div className={styles.row_title}>Vol.</div>
                    <div className={styles.vol}>$62m</div>
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.price}>
                    {poolPriceDisplay === undefined
                        ? '...'
                        : shouldInvertDisplay
                        ? `${tokenBCharacter}${poolPriceDisplay}`
                        : `${tokenACharacter}${poolPriceDisplay}`}
                </div>
                <div>
                    <div className={styles.row_title}>24h</div>
                    <div className={styles.hours}>1.54%</div>
                </div>
            </div>
        </div>
    );
}
