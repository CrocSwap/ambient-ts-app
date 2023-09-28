import styles from './ExchangeCard.module.css';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import { useContext, useEffect, useState } from 'react';
import { ZERO_ADDRESS } from '../../../../../constants';
import { DefaultTooltip } from '../../../StyledTooltip/StyledTooltip';
import { TokenContext } from '../../../../../contexts/TokenContext';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TokenPriceFn } from '../../../../../App/functions/fetchTokenPrice';
import { getFormattedNumber } from '../../../../../App/functions/getFormattedNumber';
import uriToHttp from '../../../../../utils/functions/uriToHttp';
import TokenIcon from '../../../TokenIcon/TokenIcon';
import { ethereumMainnet } from '../../../../../utils/networks/ethereumMainnet';
import { toDisplayQty } from '@crocswap-libs/sdk';

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
        chainData: { chainId },
    } = useContext(CrocEnvContext);

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
                    isUSD: true,
                })}
            </p>
            <p className={styles.amount}>{dexBalanceTruncated}</p>
        </div>
    );
}
