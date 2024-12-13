import { toDisplayQty } from '@crocswap-libs/sdk';
import { useContext, useEffect, useState } from 'react';
import { TokenPriceFn } from '../../../../../ambient-utils/api';
import { ZERO_ADDRESS } from '../../../../../ambient-utils/constants';
import {
    getFormattedNumber,
    uriToHttp,
} from '../../../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../../../ambient-utils/types';
import { AppStateContext } from '../../../../../contexts';
import { TokenContext } from '../../../../../contexts/TokenContext';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
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

    const isMobile = useMediaQuery('(max-width: 800px)');

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
                    if (price) setTokenPrice(price);
                }
            } catch (err) {
                console.error(err);
            }
        })();
    }, [token?.address, chainId]);

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

    return (
        <div className={styles.exchange_row}>
            {tokenInfo}
            <p className={styles.value}>
                {getFormattedNumber({
                    value: tokenUsdPrice * (dexBalanceDisplayNum ?? 0),
                    prefix: '$',
                })}
            </p>
            <p className={styles.amount}>{dexBalanceTruncated}</p>
        </div>
    );
}
