import { TokenIF } from '../../../../../utils/interfaces/exports';
import styles from './WalletCard.module.css';
import { useContext, useEffect, useState } from 'react';
import { ZERO_ADDRESS } from '../../../../../constants';
import { DefaultTooltip } from '../../../StyledTooltip/StyledTooltip';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TokenContext } from '../../../../../contexts/TokenContext';
import { TokenPriceFn } from '../../../../../App/functions/fetchTokenPrice';
import TokenIcon from '../../../TokenIcon/TokenIcon';
import { getFormattedNumber } from '../../../../../App/functions/getFormattedNumber';
import uriToHttp from '../../../../../utils/functions/uriToHttp';
import { ethereumMainnet } from '../../../../../utils/networks/ethereumMainnet';
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
            try {
                if (tokenFromMap?.symbol) {
                    const mainnetAddress =
                        ethereumMainnet.tokens[
                            tokenFromMap?.symbol as keyof typeof ethereumMainnet.tokens
                        ];
                    if (mainnetAddress) {
                        const price = await cachedFetchTokenPrice(
                            mainnetAddress === ZERO_ADDRESS
                                ? ethereumMainnet.tokens['WETH']
                                : mainnetAddress,
                            ethereumMainnet.chainId,
                        );
                        if (price) setTokenPrice(price);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        })();
    }, [tokenMapKey]);

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
                    isUSD: true,
                })}
            </p>
            <p className={styles.amount}>{walletBalanceTruncated}</p>
        </div>
    );
}
