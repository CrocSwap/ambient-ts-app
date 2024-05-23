import { TokenIF } from '../../../../../ambient-utils/types';
import styles from './WalletCard.module.css';
import { useContext, useEffect, useState } from 'react';
import { ZERO_ADDRESS } from '../../../../../ambient-utils/constants';
import { DefaultTooltip } from '../../../StyledTooltip/StyledTooltip';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TokenContext } from '../../../../../contexts/TokenContext';
import { TokenPriceFn } from '../../../../../ambient-utils/api';
import TokenIcon from '../../../TokenIcon/TokenIcon';
import {
    getFormattedNumber,
    uriToHttp,
} from '../../../../../ambient-utils/dataLayer';
import { toDisplayQty } from '@crocswap-libs/sdk';

interface propsIF {
    token: TokenIF;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function WalletCard(props: propsIF) {
    const { token, cachedFetchTokenPrice } = props;
    const {
        tokens: { getTokenByAddress },
    } = useContext(TokenContext);
    const {
        chainData: { chainId },
        crocEnv,
    } = useContext(CrocEnvContext);

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
            if (!crocEnv) return;
            try {
                if (tokenFromMap?.symbol) {
                    const price = await cachedFetchTokenPrice(
                        tokenFromMap.address,
                        chainId,
                        crocEnv,
                    );
                    if (price) setTokenPrice(price);
                }
            } catch (err) {
                console.error(err);
            }
        })();
    }, [crocEnv, tokenMapKey]);

    const tokenUsdPrice = tokenPrice?.usdPrice ?? 0;

    const walletBalanceDisplay = token.walletBalance
        ? toDisplayQty(token.walletBalance, token.decimals)
        : undefined;

    const walletBalanceDisplayNum = walletBalanceDisplay
        ? parseFloat(walletBalanceDisplay)
        : undefined;

    const walletBalanceTruncated = walletBalanceDisplayNum
        ? getFormattedNumber({
              value: walletBalanceDisplayNum,
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
                    alt={token.symbol ?? '?'}
                    size='2xl'
                />
                <p className={styles.token_key}>{token.symbol ?? '?'}</p>
            </div>
        </DefaultTooltip>
    );

    const tokenInfo = (
        <div className={styles.token_info}>
            {iconAndSymbolWithTooltip}
            <p>
                {tokenFromMap?.name
                    ? tokenFromMap?.name
                    : token?.name
                    ? token?.name
                    : '???'}
            </p>
        </div>
    );

    if (
        !token ||
        !tokenFromMap ||
        (token?.address !== ZERO_ADDRESS &&
            (!token.walletBalance || token.walletBalance === '0'))
    )
        return <></>;

    return (
        <div className={styles.wallet_row}>
            {tokenInfo}
            <p className={styles.value}>
                {getFormattedNumber({
                    value: tokenUsdPrice * (walletBalanceDisplayNum ?? 0),
                    prefix: '$',
                })}
            </p>
            <p className={styles.amount}>{walletBalanceTruncated}</p>
        </div>
    );
}
