import { toDisplayPrice, toDisplayQty } from '@crocswap-libs/sdk';
import { useContext, useEffect, useState } from 'react';
import { TokenPriceFn } from '../../../../../ambient-utils/api';
import {
    CACHE_UPDATE_FREQ_IN_MS,
    ZERO_ADDRESS,
} from '../../../../../ambient-utils/constants';
import {
    getFormattedNumber,
    uriToHttp,
} from '../../../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../../../ambient-utils/types';
import {
    AppStateContext,
    CachedDataContext,
    ChainDataContext,
    CrocEnvContext,
} from '../../../../../contexts';
import { TokenContext } from '../../../../../contexts/TokenContext';
import { useMediaQuery } from '../../../../../utils/hooks/useMediaQuery';
import { DefaultTooltip } from '../../../StyledTooltip/StyledTooltip';
import TokenIcon from '../../../TokenIcon/TokenIcon';
import styles from './ExchangeCard.module.css';

interface propsIF {
    token: TokenIF;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function ExchangeCard(props: propsIF) {
    const { token, cachedFetchTokenPrice } = props;
    const {
        tokens: { getTokenByAddress },
    } = useContext(TokenContext);

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const { nativeTokenUsdPrice } = useContext(ChainDataContext);
    const { cachedQuerySpotPrice } = useContext(CachedDataContext);
    const { crocEnv } = useContext(CrocEnvContext);

    const isMobile = useMediaQuery('(max-width: 800px)');

    const tokenMapKey = token?.address?.toLowerCase() + '_' + chainId;

    const tokenFromMap = token?.address
        ? getTokenByAddress(token.address)
        : null;

    const [tokenPrice, setTokenPrice] = useState<{
        nativePrice?:
            | {
                  value: string;
                  decimals: number;
                  name: string;
                  symbol: string;
              }
            | undefined;
        usdPrice: number;
        exchangeAddress?: string | undefined;
        exchangeName?: string | undefined;
    }>();

    useEffect(() => {
        (async () => {
            try {
                if (tokenFromMap?.symbol) {
                    const price = await cachedFetchTokenPrice(
                        tokenFromMap.address,
                        chainId,
                    );
                    if (price) {
                        setTokenPrice(price);
                    } else {
                        if (!crocEnv || !nativeTokenUsdPrice) return;
                        const ethPoolPriceNonDisplay =
                            await cachedQuerySpotPrice(
                                crocEnv,
                                ZERO_ADDRESS,
                                tokenFromMap.address,
                                chainId,
                                Math.floor(
                                    Date.now() / CACHE_UPDATE_FREQ_IN_MS,
                                ),
                            );
                        if (!ethPoolPriceNonDisplay || !nativeTokenUsdPrice)
                            setTokenPrice(undefined);

                        const ethPoolPriceDisplay = toDisplayPrice(
                            ethPoolPriceNonDisplay,
                            18,
                            tokenFromMap.decimals,
                        );
                        setTokenPrice({
                            usdPrice: ethPoolPriceDisplay * nativeTokenUsdPrice,
                        });
                    }
                }
            } catch (err) {
                console.error(err);
            }
        })();
    }, [tokenMapKey, nativeTokenUsdPrice, crocEnv]);

    const tokenUsdPrice = tokenPrice?.usdPrice ?? 0;

    const dexBalanceDisplay = token.dexBalance
        ? toDisplayQty(token.dexBalance, token.decimals)
        : undefined;

    const dexBalanceDisplayNum = dexBalanceDisplay
        ? parseFloat(dexBalanceDisplay)
        : undefined;

    const dexBalanceTruncated = dexBalanceDisplayNum
        ? getFormattedNumber({
              value: dexBalanceDisplayNum,
          })
        : '0';

    const iconAndSymbolWithTooltip = (
        <DefaultTooltip
            interactive
            title={`${tokenFromMap?.symbol}: ${tokenFromMap?.address}`}
            disableHoverListener={tokenFromMap?.address === ZERO_ADDRESS}
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <div className={styles.token_icon}>
                <TokenIcon
                    token={token}
                    src={uriToHttp(token.logoURI)}
                    alt={token?.symbol}
                    size='2xl'
                />
                <p className={styles.token_key}>{token.symbol}</p>
            </div>
        </DefaultTooltip>
    );

    const tokenInfo = (
        <div className={styles.token_info}>
            {iconAndSymbolWithTooltip}
            {!isMobile && (
                <p>
                    {tokenFromMap?.name
                        ? tokenFromMap?.name
                        : token?.name
                          ? token?.name
                          : '???'}
                </p>
            )}
        </div>
    );

    if (
        !token ||
        !tokenFromMap ||
        (token.address !== ZERO_ADDRESS &&
            (!token.dexBalance || token.dexBalance === '0'))
    )
        return <></>;

    const balanceValue = tokenUsdPrice * (dexBalanceDisplayNum ?? 0);

    return (
        <div className={styles.exchange_row}>
            {tokenInfo}
            <p className={styles.value}>
                {balanceValue
                    ? getFormattedNumber({
                          value: balanceValue,
                          prefix: '$',
                      })
                    : '...'}
            </p>
            <p className={styles.amount}>{dexBalanceTruncated}</p>
        </div>
    );
}
